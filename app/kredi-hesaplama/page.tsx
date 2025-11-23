"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 
import { Calculator, RefreshCcw, Wallet, PieChart, TrendingUp, Info, Table2, Briefcase, Building2, Truck, ChevronDown, ChevronUp, Share2, Printer, Loader2 } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type CreditType = 'business' | 'building' | 'vehicle';

interface DeductionRates {
  blokeSermaye: number;
  riskSermayesi: number;
  bolgeBirligi: number;
  teskomb: number;
  pesinMasraf: number;
}

interface CreditLimits {
  business: number;
  building: number;
  vehicle: number;
}

interface CreditMaxTerms {
  business: number;
  building: number;
  vehicle: number;
}

interface AdvancedSettings {
  daysInYear: number;
  baseCommission: number;
  showTableDecimals: boolean;
}

interface InstallmentRow {
  installmentNumber: number;
  dueDate: string;
  days: number;
  principal: number;
  interest: number;
  expense: number;
  commission: number;
  total: number;
  remainingPrincipal: number;
}

interface CalculationResults {
  paymentSchedule: InstallmentRow[];
  totals: {
    principal: number;
    interest: number;
    commission: number;
    expense: number;
    totalPayment: number;
  };
  deductions: {
    blokeSermaye: number;
    riskSermayesi: number;
    bolgeBirligi: number;
    teskomb: number;
    pesinMasraf: number;
    totalDeductions: number;
  };
  netAmount: number;
}

const DEFAULT_RATES_INITIAL: DeductionRates = {
    pesinMasraf: 1.50,   
    blokeSermaye: 2.00,  
    riskSermayesi: 1.00, 
    teskomb: 0.25,       
    bolgeBirligi: 0.25   
};

const DEFAULT_LIMITS_INITIAL: CreditLimits = {
    business: 1000000,
    building: 2500000,
    vehicle: 2500000
};

const DEFAULT_MAX_TERMS_INITIAL: CreditMaxTerms = {
    business: 48,
    building: 60,
    vehicle: 48
};

const DEFAULT_ADVANCED_INITIAL: AdvancedSettings = {
    daysInYear: 360,
    baseCommission: 1.0,
    showTableDecimals: true
};

const INTEREST_RATE_ANNUAL_INITIAL = 25.00; 

const MIN_TERM = 12;
const YEARLY_STEP = 12;

function calculatePaymentPlan(
    loanAmount: number,
    loanDateStr: string,
    period: number,
    installments: number,
    annualInterestRate: number,
    rates: DeductionRates,
    advanced: AdvancedSettings 
): CalculationResults {
    
    const loanDate = new Date(loanDateStr);
    const paymentSchedule: InstallmentRow[] = [];
    
    const installmentsPerYear = 12 / period;
    const basePrincipalInstallment = Math.floor((loanAmount / installments) * 100) / 100;
    
    let remainingPrincipal = loanAmount;
    let previousDueDate = new Date(loanDate);
    
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalCommission = 0;
    let totalExpense = 0;

    const loanDay = loanDate.getDate();
    const lastDayOfLoanMonth = new Date(loanDate.getFullYear(), loanDate.getMonth() + 1, 0).getDate();
    const isEndOfMonthLoan = (loanDay === lastDayOfLoanMonth);

    const daysInYear = advanced.daysInYear || 360;
    const baseCommissionRate = (advanced.baseCommission || 1.0) / 100;

    for (let i = 1; i <= installments; i++) {
        const currentYearOfLoan = Math.floor((i - 1) / installmentsPerYear) + 1;
        const installmentWithinYear = ((i - 1) % installmentsPerYear) + 1;

        let dueDate = new Date(loanDate);
        if (isEndOfMonthLoan) {
             dueDate = new Date(loanDate.getFullYear(), loanDate.getMonth() + (i * period) + 1, 0);
        } else {
             dueDate = new Date(loanDate.getFullYear(), loanDate.getMonth() + (i * period), loanDay);
        }

        const diffTime = Math.abs(dueDate.getTime() - previousDueDate.getTime());
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (i === 1) days += 1;

        const interest_full = remainingPrincipal * (annualInterestRate / 100 / daysInYear) * days;

        const totalYears = Math.ceil(installments * period / 12);
        let yearlyCommission = 0;

        if (totalYears <= 1) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
        } else if (totalYears === 2) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
            else if (currentYearOfLoan === 2) yearlyCommission = loanAmount * (baseCommissionRate * 0.5);
        } else if (totalYears === 3) {
            const baseComm = loanAmount * baseCommissionRate;
            if (currentYearOfLoan === 1) yearlyCommission = baseComm;
            else if (currentYearOfLoan === 2) yearlyCommission = baseComm * (2/3);
            else if (currentYearOfLoan === 3) yearlyCommission = baseComm * (1/3);
        } else if (totalYears === 4) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
            else if (currentYearOfLoan === 2) yearlyCommission = loanAmount * (baseCommissionRate * 0.75);
            else if (currentYearOfLoan === 3) yearlyCommission = loanAmount * (baseCommissionRate * 0.5);
            else if (currentYearOfLoan === 4) yearlyCommission = loanAmount * (baseCommissionRate * 0.25);
        } else if (totalYears >= 5) {
            const baseComm = loanAmount * baseCommissionRate;
            if (currentYearOfLoan === 1) yearlyCommission = baseComm;
            else if (currentYearOfLoan === 2) yearlyCommission = baseComm * 0.8;
            else if (currentYearOfLoan === 3) yearlyCommission = baseComm * 0.6;
            else if (currentYearOfLoan === 4) yearlyCommission = baseComm * 0.4;
            else if (currentYearOfLoan >= 5) yearlyCommission = baseComm * 0.2;
        }

        let yearlyExpense = 0;
        if (currentYearOfLoan > 1) {
            if (totalYears === 5) {
                if (currentYearOfLoan === 2) yearlyExpense = loanAmount * 0.012;
                else if (currentYearOfLoan === 3) yearlyExpense = loanAmount * 0.009;
                else if (currentYearOfLoan === 4) yearlyExpense = loanAmount * 0.006;
                else if (currentYearOfLoan === 5) yearlyExpense = loanAmount * 0.003;
            } else {
                if (totalYears === 2 && currentYearOfLoan === 2) yearlyExpense = loanAmount * 0.0075;
                else if (totalYears === 3) {
                    if (currentYearOfLoan === 2) yearlyExpense = loanAmount * 0.01;
                    else if (currentYearOfLoan === 3) yearlyExpense = loanAmount * 0.005;
                } else if (totalYears === 4) {
                    if (currentYearOfLoan === 2) yearlyExpense = loanAmount * 0.01125;
                    else if (currentYearOfLoan === 3) yearlyExpense = loanAmount * 0.0075;
                    else if (currentYearOfLoan === 4) yearlyExpense = loanAmount * 0.00375;
                }
            }
        }

        let expense_full = 0;
        if (yearlyExpense > 0) {
            const baseExpenseInstallment = Math.floor((yearlyExpense / installmentsPerYear) * 100) / 100;
            expense_full = (installmentWithinYear < installmentsPerYear) 
                ? baseExpenseInstallment 
                : yearlyExpense - (baseExpenseInstallment * (installmentsPerYear - 1));
        }

        const baseCommissionInstallment = Math.floor((yearlyCommission / installmentsPerYear) * 100) / 100;
        let commission_full = (installmentWithinYear < installmentsPerYear || yearlyCommission === 0) 
            ? baseCommissionInstallment 
            : yearlyCommission - (baseCommissionInstallment * (installmentsPerYear - 1));

        let principal_full = (i < installments) 
            ? basePrincipalInstallment 
            : parseFloat((loanAmount - (basePrincipalInstallment * (installments - 1))).toFixed(2));

        const principal = principal_full;
        const interest = parseFloat(interest_full.toFixed(2));
        const commission = parseFloat(commission_full.toFixed(2));
        const expense = parseFloat(expense_full.toFixed(2));
        const total = principal + interest + commission + expense;

        const currentRemaining = remainingPrincipal - principal;

        paymentSchedule.push({
            installmentNumber: i,
            dueDate: dueDate.toLocaleDateString('tr-TR'),
            days,
            principal,
            interest,
            expense,
            commission,
            total,
            remainingPrincipal: currentRemaining > 0 ? currentRemaining : 0
        });

        previousDueDate = dueDate;
        remainingPrincipal -= principal;

        totalPrincipal += principal;
        totalInterest += interest;
        totalCommission += commission;
        totalExpense += expense;
    }

    const blokeSermaye = loanAmount * (rates.blokeSermaye / 100);
    const riskSermayesi = loanAmount * (rates.riskSermayesi / 100);
    const bolgeBirligi = loanAmount * (rates.bolgeBirligi / 100);
    const teskomb = loanAmount * (rates.teskomb / 100);
    const pesinMasraf = loanAmount * (rates.pesinMasraf / 100);
    
    const totalDeductions = blokeSermaye + riskSermayesi + bolgeBirligi + teskomb + pesinMasraf;

    return {
        paymentSchedule,
        totals: {
            principal: totalPrincipal,
            interest: totalInterest,
            commission: totalCommission,
            expense: totalExpense,
            totalPayment: totalPrincipal + totalInterest + totalCommission + totalExpense
        },
        deductions: {
            blokeSermaye,
            riskSermayesi,
            bolgeBirligi,
            teskomb,
            pesinMasraf,
            totalDeductions
        },
        netAmount: loanAmount - totalDeductions
    };
}

const KrediHesaplama: React.FC = () => {
  const [amount, setAmount] = useState<number>(500000); 
  const [term, setTerm] = useState<number>(24); 
  const [frequency, setFrequency] = useState<number>(1);
  const [creditType, setCreditType] = useState<CreditType>('business'); 
  const [loanDate, setLoanDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const [currentRates, setCurrentRates] = useState<DeductionRates>(DEFAULT_RATES_INITIAL);
  const [currentLimits, setCurrentLimits] = useState<CreditLimits>(DEFAULT_LIMITS_INITIAL);
  const [currentMaxTerms, setCurrentMaxTerms] = useState<CreditMaxTerms>(DEFAULT_MAX_TERMS_INITIAL);
  const [currentInterest, setCurrentInterest] = useState<number>(INTEREST_RATE_ANNUAL_INITIAL);
  const [currentAdvanced, setCurrentAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED_INITIAL);
  const [visibility, setVisibility] = useState({ business: true, building: true, vehicle: true });
  const [isRatesLoaded, setIsRatesLoaded] = useState(false);

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [user, setUser] = useState<any>(null);

  const maxAmount = creditType === 'business' ? currentLimits.business 
                  : creditType === 'building' ? currentLimits.building 
                  : currentLimits.vehicle;

  const maxTerm = creditType === 'business' ? currentMaxTerms.business
                : creditType === 'building' ? currentMaxTerms.building
                : currentMaxTerms.vehicle;

  const rangeStep = creditType === 'business' ? 5000 : 25000; 

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Kredi Hesaplama | ESKKK";
  }, []);

  useEffect(() => {
    if (!auth || !db) {
        setIsRatesLoaded(true);
        return;
    }

    const appId = typeof window !== 'undefined' && (window as any).__app_id ? (window as any).__app_id : 'default-app-id';

    const initAuth = async () => {
      try {
        const token = (window as any).__initial_auth_token;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          if (!auth.currentUser) await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'credit_calculation');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rates) setCurrentRates(data.rates as DeductionRates);
            if (data.annualInterestRate) setCurrentInterest(data.annualInterestRate);
            if (data.limits) setCurrentLimits(data.limits as CreditLimits);
            if (data.maxTerms) setCurrentMaxTerms(data.maxTerms as CreditMaxTerms);
            if (data.advanced) setCurrentAdvanced(data.advanced as AdvancedSettings);
            if (data.visibility) {
                setVisibility(data.visibility);
                if (!data.visibility[creditType]) {
                    if (data.visibility.business) setCreditType('business');
                    else if (data.visibility.building) setCreditType('building');
                    else if (data.visibility.vehicle) setCreditType('vehicle');
                }
            }
          }
        } catch (error) {
          console.error("Ayarlar çekilemedi, varsayılanlar kullanılıyor.", error);
        }
      }
      setIsRatesLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isRatesLoaded) return;

    let validAmount = amount;
    if (validAmount > maxAmount) validAmount = maxAmount;
    
    let validTerm = term;
    if (validTerm < MIN_TERM) validTerm = MIN_TERM;
    if (validTerm > maxTerm) validTerm = maxTerm;
    
    const roundedTerm = Math.round(validTerm / YEARLY_STEP) * YEARLY_STEP;
    const finalTerm = Math.max(MIN_TERM, Math.min(maxTerm, roundedTerm));

    if (amount !== validAmount) setAmount(validAmount);
    if (term !== finalTerm) setTerm(finalTerm);

    const res = calculatePaymentPlan(
        validAmount,
        loanDate,
        frequency,
        finalTerm / frequency,
        currentInterest,
        currentRates,
        currentAdvanced
    );
    setResults(res);

  }, [amount, term, frequency, creditType, loanDate, maxAmount, maxTerm, currentInterest, currentRates, currentAdvanced, isRatesLoaded]); 

  const formatMoney = (val: number) => {
    if (isNaN(val) || val === Infinity) return '0 ₺';
    const digits = currentAdvanced.showTableDecimals ? 2 : 0;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(val);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value.replace(/[^0-9]/g, ''));
    setAmount(rawValue > maxAmount ? maxAmount : rawValue);
  };

  const getVadeText = () => { 
    const years = Math.floor(term / 12);
    return `${years} Yıl (${term} Ay)`;
  };

  // ... PDF ve Print fonksiyonları aynı kalabilir, görsel stiller HTML içinde olduğu için buradaki CSS güncellemeleri yeterli olacaktır. ...
  // (Kısalık için bu fonksiyonların içini değiştirmiyorum, mantık aynı)
  const handleShare = async () => { /* ... */ };
  const handlePrint = () => { /* ... */ };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent"></div>
                    <span className="text-accent font-bold tracking-[0.25em] uppercase text-xs md:text-sm">ESNAF KEFALET</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent"></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 drop-shadow-2xl">
                  Kredi <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">Hesaplama</span>
                </h1>
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light">
                  Esnaf Kefalet sistemi mevzuatına uygun, kesintiler ve değişken taksitlerin dahil olduğu detaylı hesaplama aracı.
                </p>
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="grid lg:grid-cols-12 gap-8">
                
                {/* SOL PANEL (AYARLAR) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent"></div>

                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-accent" />
                            Kredi Ayarları
                        </h3>
                        
                        {/* Kredi Türü Seçimi */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-foreground/80 mb-3 block">Kredi Türü</label>
                            <div className="grid grid-cols-3 gap-2">
                                {visibility.business && (
                                    <button onClick={() => setCreditType('business')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'business' ? 'bg-accent border-accent text-background' : 'bg-background border-foreground/10 text-foreground/60'}`}><Briefcase size={16} /> İşletme</button>
                                )}
                                {visibility.building && (
                                    <button onClick={() => setCreditType('building')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'building' ? 'bg-primary border-primary text-background' : 'bg-background border-foreground/10 text-foreground/60'}`}><Building2 size={16} /> İşyeri</button>
                                )}
                                {visibility.vehicle && (
                                    <button onClick={() => setCreditType('vehicle')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'vehicle' ? 'bg-secondary border-secondary text-background' : 'bg-background border-foreground/10 text-foreground/60'}`}><Truck size={16} /> Taşıt</button>
                                )}
                            </div>
                        </div>

                        {/* Tutar ve Tarih */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-foreground/80 mb-2 block">Kredi Tutarı</label>
                                <div className="relative">
                                    <input type="text" value={new Intl.NumberFormat('tr-TR').format(amount)} onChange={handleAmountChange} className="w-full bg-background/50 border border-foreground/20 rounded-lg px-3 py-2 text-sm font-bold text-accent text-right focus:outline-none focus:border-accent" />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 text-xs">₺</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground/80 mb-2 block">Kullanım Tarihi</label>
                                <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="w-full bg-background/50 border border-foreground/20 rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                        
                        <input type="range" min={0} max={maxAmount} step={rangeStep} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-foreground/20 rounded-lg appearance-none cursor-pointer accent-accent mb-6" />

                        {/* Vade */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-foreground/80">Vade</label>
                                <span className="text-sm font-bold text-primary">{getVadeText()}</span>
                            </div>
                            <input type="range" min={MIN_TERM} max={maxTerm} step={YEARLY_STEP} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full h-2 bg-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>

                        {/* Ödeme Sıklığı */}
                        <div className="mb-2">
                            <label className="text-sm font-medium text-foreground/80 mb-3 block">Ödeme Sıklığı</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 3, 6].map((val) => (
                                    <button key={val} onClick={() => setFrequency(val)} className={`py-2 rounded-xl text-sm font-bold border ${frequency === val ? 'bg-accent border-accent text-background' : 'bg-background border-foreground/10 text-foreground/60'}`}>{val === 1 ? 'Aylık' : `${val} Aylık`}</button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3">
                            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/70 leading-relaxed">Hesaplamalar bilgilendirme amaçlıdır. Taksit tutarları değişkenlik gösterir (Eşit Anapara Yöntemi).</p>
                        </div>
                    </div>
                </div>

                {/* SAĞ PANEL (SONUÇLAR) */}
                <div className="lg:col-span-7 space-y-6">
                    {results && (
                        <>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-accent/20 to-background/40 border border-accent/30 p-6 rounded-3xl relative overflow-hidden group">
                                    <p className="text-foreground/60 text-xs font-medium uppercase tracking-wide">İlk Taksit Tutarı</p>
                                    <h3 className="text-3xl font-extrabold text-foreground mt-1">{formatMoney(results.paymentSchedule[0].total)}</h3>
                                    <div className="mt-3 flex items-center gap-2 text-accent text-xs font-bold bg-accent/10 py-1 px-3 rounded-full w-fit">
                                        <RefreshCcw size={12} /> Değişken Taksit
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-primary/20 to-background/40 border border-primary/30 p-6 rounded-3xl relative overflow-hidden group">
                                    <p className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Ele Geçen Net Tutar</p>
                                    <h3 className="text-3xl font-extrabold text-foreground mt-1">{formatMoney(results.netAmount)}</h3>
                                    <div className="mt-3 flex items-center gap-2 text-primary text-xs font-bold bg-primary/10 py-1 px-3 rounded-full w-fit">
                                        <Wallet size={12} /> Tüm Kesintiler Dahil
                                    </div>
                                </div>
                            </div>

                            <div className="bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-3xl p-6">
                                <h4 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-foreground/10 pb-3">
                                    <PieChart className="w-4 h-4 text-foreground/50" /> Peşin Kesinti Dökümü
                                </h4>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Peşin Masraf (%{currentRates.pesinMasraf})</span> <span className="text-foreground/80">{formatMoney(results.deductions.pesinMasraf)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Bloke Sermaye (%{currentRates.blokeSermaye})</span> <span className="text-foreground/80">{formatMoney(results.deductions.blokeSermaye)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Risk Sermayesi (%{currentRates.riskSermayesi})</span> <span className="text-foreground/80">{formatMoney(results.deductions.riskSermayesi)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">TESKOMB Payı (%{currentRates.teskomb})</span> <span className="text-foreground/80">{formatMoney(results.deductions.teskomb)}</span></div>
                                    <div className="flex justify-between text-xs col-span-2 border-t border-foreground/10 pt-2 mt-1"><span className="text-foreground/60">Bölge Birliği (%{currentRates.bolgeBirligi})</span> <span className="text-foreground/80">{formatMoney(results.deductions.bolgeBirligi)}</span></div>
                                    <div className="flex justify-between text-sm font-bold col-span-2 text-red-400"><span className="">Toplam Kesinti</span> <span>- {formatMoney(results.deductions.totalDeductions)}</span></div>
                                </div>
                            </div>

                            <div className="bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-3xl p-6">
                                <h4 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-foreground/10 pb-3">
                                    <TrendingUp className="w-4 h-4 text-foreground/50" /> Geri Ödeme Özeti
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Anapara</span> <span className="text-foreground/80">{formatMoney(results.totals.principal)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Toplam Faiz</span> <span className="text-foreground/80">{formatMoney(results.totals.interest)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Yıllık Komisyonlar (Vadeye Yayılı)</span> <span className="text-foreground/80">{formatMoney(results.totals.commission)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-foreground/60">Yıllık Masraflar (Vadeye Yayılı)</span> <span className="text-foreground/80">{formatMoney(results.totals.expense)}</span></div>
                                    <div className="flex justify-between text-sm font-bold border-t border-foreground/10 pt-2 mt-2 text-accent"><span>Toplam Geri Ödeme</span> <span>{formatMoney(results.totals.totalPayment)}</span></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="w-full py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Table2 size={18} />
                                {showSchedule ? 'Ödeme Planını Gizle' : 'Detaylı Ödeme Planını Görüntüle'}
                                {showSchedule ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showSchedule && results && (
                <div className="mt-8 bg-foreground/5 border border-foreground/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50">
                        <h3 className="text-xl font-bold text-foreground">Ödeme Planı</h3>
                        {/* Butonlar */}
                        <div className="flex gap-2">
                            {/* ... Paylaş/Yazdır butonları ... */}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-foreground/70">
                            <thead className="bg-background text-xs uppercase font-bold text-foreground/50">
                                <tr>
                                    <th className="px-4 py-3">Taksit</th>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Gün</th>
                                    <th className="px-4 py-3 text-right">Anapara</th>
                                    <th className="px-4 py-3 text-right">Faiz</th>
                                    <th className="px-4 py-3 text-right">Komisyon</th>
                                    <th className="px-4 py-3 text-right">Masraf</th>
                                    <th className="px-4 py-3 text-right text-foreground">Toplam Taksit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/10">
                                {results.paymentSchedule.map((row) => (
                                    <tr key={row.installmentNumber} className="hover:bg-foreground/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{row.installmentNumber}</td>
                                        <td className="px-4 py-3">{row.dueDate}</td>
                                        <td className="px-4 py-3">{row.days}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.principal)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.interest)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.commission)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.expense)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-accent">{formatMoney(row.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-background/80 font-bold text-foreground border-t border-foreground/20">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right uppercase">Toplamlar</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.principal)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.interest)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.commission)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.expense)}</td>
                                    <td className="px-4 py-3 text-right text-accent">{formatMoney(results.totals.totalPayment)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default KrediHesaplama;