"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 
import { Calculator, RefreshCcw, Wallet, PieChart, TrendingUp, Info, Table2, Briefcase, Building2, Truck, ChevronDown, ChevronUp, Share2, Printer, Loader2 } from 'lucide-react';

// Firebase imports
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// --- TİP TANIMLARI ---

type CreditType = 'business' | 'building' | 'vehicle';

interface DeductionRates {
  blokeSermaye: number;
  riskSermayesi: number;
  bolgeBirligi: number;
  teskomb: number;
  pesinMasraf: number;
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

// --- SABİTLER ---

const CONFIG = {
    daysInYearForInterest: 360
};

// Kesinti Oranları (Yüzde)
const DEFAULT_RATES: DeductionRates = {
    pesinMasraf: 1.50,   
    blokeSermaye: 2.00,  
    riskSermayesi: 1.00, 
    teskomb: 0.25,       
    bolgeBirligi: 0.25   
};

const INTEREST_RATE_ANNUAL = 25.00; // %25 Yıllık Faiz

// Limitler
const BUSINESS_MAX_AMOUNT = 1000000;
const BUILDING_MAX_AMOUNT = 2500000;
const VEHICLE_MAX_AMOUNT = 2500000;

const MIN_TERM = 12;
const BUSINESS_MAX_TERM = 48;
const BUILDING_MAX_TERM = 60;
const VEHICLE_MAX_TERM = 48;
const YEARLY_STEP = 12;

// --- HESAPLAMA MOTORU ---

function calculatePaymentPlan(
    loanAmount: number,
    loanDateStr: string,
    period: number,
    installments: number,
    annualInterestRate: number,
    rates: DeductionRates
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

        const interest_full = remainingPrincipal * (annualInterestRate / 100 / CONFIG.daysInYearForInterest) * days;

        const totalYears = Math.ceil(installments * period / 12);
        let yearlyCommission = 0;

        const baseCommissionRate = 0.01; 
        if (totalYears <= 1) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
        } else if (totalYears === 2) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
            else if (currentYearOfLoan === 2) yearlyCommission = loanAmount * 0.005;
        } else if (totalYears === 3) {
            const baseComm = loanAmount * baseCommissionRate;
            if (currentYearOfLoan === 1) yearlyCommission = baseComm;
            else if (currentYearOfLoan === 2) yearlyCommission = baseComm * (2/3);
            else if (currentYearOfLoan === 3) yearlyCommission = baseComm * (1/3);
        } else if (totalYears === 4) {
            if (currentYearOfLoan === 1) yearlyCommission = loanAmount * baseCommissionRate;
            else if (currentYearOfLoan === 2) yearlyCommission = loanAmount * 0.0075;
            else if (currentYearOfLoan === 3) yearlyCommission = loanAmount * 0.005;
            else if (currentYearOfLoan === 4) yearlyCommission = loanAmount * 0.0025;
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
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<any>(null);

  const maxAmount = creditType === 'business' ? BUSINESS_MAX_AMOUNT : BUILDING_MAX_AMOUNT;
  const maxTerm = creditType === 'business' ? BUSINESS_MAX_TERM : creditType === 'vehicle' ? VEHICLE_MAX_TERM : BUILDING_MAX_TERM;
  const rangeStep = creditType === 'business' ? 5000 : 25000; 

  // Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
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
        INTEREST_RATE_ANNUAL,
        DEFAULT_RATES
    );
    setResults(res);

  }, [amount, term, frequency, creditType, loanDate, maxAmount, maxTerm]); 

  const formatMoney = (val: number) => {
    if (isNaN(val) || val === Infinity) return '0 ₺';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(val);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value.replace(/[^0-9]/g, ''));
    setAmount(rawValue > maxAmount ? maxAmount : rawValue);
  };

  const getVadeText = () => { 
    const years = Math.floor(term / 12);
    return `${years} Yıl (${term} Ay)`;
  };

  // --- PDF İÇİN YARDIMCI FONKSİYONLAR ---

  const formatMoneyForPDF = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' TL';
  };

  const normalizeForPDF = (text: string) => {
    return text
      .replace(/Ğ/g, "G").replace(/ğ/g, "g")
      .replace(/Ü/g, "U").replace(/ü/g, "u")
      .replace(/Ş/g, "S").replace(/ş/g, "s")
      .replace(/İ/g, "I").replace(/ı/g, "i")
      .replace(/Ö/g, "O").replace(/ö/g, "o")
      .replace(/Ç/g, "C").replace(/ç/g, "c")
      .replace(/₺/g, "TL");
  };

  // --- PDF PAYLAŞIM VE OLUŞTURMA ---
  
  const handleShare = async () => {
    if (!results) return;
    setIsPdfGenerating(true);

    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();

      // 1. Kurum Başlığı
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74); // Emerald Green
      doc.text(normalizeForPDF("S.S. NILUFER ILCESI ESNAF VE SANATKARLAR"), 105, 20, { align: 'center' });
      doc.text(normalizeForPDF("KREDI VE KEFALET KOOPERATIFI"), 105, 26, { align: 'center' });

      // 2. Alt Başlık
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50); 
      doc.text(normalizeForPDF("KREDI ODEME PLANI"), 105, 36, { align: 'center' });

      // 3. Çizgi
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 40, 190, 40);

      // 4. Özet Bilgiler Kutusu
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      doc.text(normalizeForPDF(`Kredi Tutari: ${formatMoneyForPDF(amount)}`), 20, 50);
      doc.text(normalizeForPDF(`Vade: ${getVadeText()}`), 20, 56);
      
      doc.text(normalizeForPDF(`Toplam Geri Odeme: ${formatMoneyForPDF(results.totals.totalPayment)}`), 120, 50);
      doc.text(normalizeForPDF(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), 120, 56);

      // 5. ÖDEME PLANI TABLOSU
      const tableColumn = ["Taksit", "Tarih", "Anapara", "Faiz", "Komisyon", "Masraf", "Toplam"];
      const tableRows = results.paymentSchedule.map(row => [
          row.installmentNumber,
          row.dueDate,
          formatMoneyForPDF(row.principal),
          formatMoneyForPDF(row.interest),
          formatMoneyForPDF(row.commission),
          formatMoneyForPDF(row.expense),
          formatMoneyForPDF(row.total)
      ]);

      // @ts-ignore - autoTable types
      autoTable(doc, {
          head: [tableColumn.map(normalizeForPDF)],
          body: tableRows,
          startY: 65,
          theme: 'grid',
          styles: { 
              font: "helvetica", 
              fontSize: 8,
              cellPadding: 2,
              halign: 'right'
          },
          headStyles: { 
              fillColor: [22, 163, 74],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
          },
          columnStyles: {
              0: { halign: 'center' },
              1: { halign: 'center' } 
          },
          foot: [
              [
                  "", "", 
                  formatMoneyForPDF(results.totals.principal),
                  formatMoneyForPDF(results.totals.interest),
                  formatMoneyForPDF(results.totals.commission),
                  formatMoneyForPDF(results.totals.expense),
                  formatMoneyForPDF(results.totals.totalPayment)
              ]
          ],
          showFoot: 'lastPage',
          footStyles: {
              fillColor: [240, 240, 240],
              textColor: [50, 50, 50],
              fontStyle: 'bold',
              halign: 'right'
          }
      });

      // 6. KESİNTİLER VE NET TUTAR TABLOSU (YATAY TASARIM)
      
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 10;
      
      // Sayfa sonu kontrolü
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      // Başlık
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(normalizeForPDF("KESINTI DETAYLARI"), 14, finalY);
      
      // 1. Yatay Kesinti Tablosu
      // @ts-ignore
      autoTable(doc, {
          startY: finalY + 2,
          head: [[
              normalizeForPDF("Pesin Masraf\n(%1.50)"),
              normalizeForPDF("Bloke Sermaye\n(%2.00)"),
              normalizeForPDF("Risk Sermayesi\n(%1.00)"),
              normalizeForPDF("TESKOMB Payi\n(%0.25)"),
              normalizeForPDF("Bolge Birligi\n(%0.25)")
          ]],
          body: [[
              formatMoneyForPDF(results.deductions.pesinMasraf),
              formatMoneyForPDF(results.deductions.blokeSermaye),
              formatMoneyForPDF(results.deductions.riskSermayesi),
              formatMoneyForPDF(results.deductions.teskomb),
              formatMoneyForPDF(results.deductions.bolgeBirligi)
          ]],
          theme: 'grid',
          styles: { 
              font: "helvetica",
              fontSize: 8,
              cellPadding: 3,
              halign: 'center', // Değerleri ortala
              valign: 'middle'
          },
          headStyles: { 
              fillColor: [245, 245, 245], 
              textColor: [80, 80, 80], 
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [200, 200, 200]
          },
          bodyStyles: {
              textColor: [50, 50, 50]
          }
      });

      // 2. Net Toplamlar (Hemen altına, sağa yaslı bir özet gibi)
      // @ts-ignore
      const summaryY = doc.lastAutoTable.finalY + 5;

      // Temiz görünüm için 'plain' tema kullanan küçük bir tablo
      // @ts-ignore
      autoTable(doc, {
          startY: summaryY,
          body: [[
              normalizeForPDF("TOPLAM KESINTI"), 
              formatMoneyForPDF(results.deductions.totalDeductions),
              "", // Boşluk
              normalizeForPDF("NET ELE GECEN TUTAR"), 
              formatMoneyForPDF(results.netAmount)
          ]],
          theme: 'plain',
          styles: { 
              font: "helvetica", 
              fontSize: 10, 
              cellPadding: 2,
              valign: 'middle'
          },
          columnStyles: {
              0: { fontStyle: 'bold', halign: 'right', cellWidth: 40, textColor: [100, 100, 100] },
              1: { fontStyle: 'bold', halign: 'left', cellWidth: 40 },
              2: { cellWidth: 10 }, // Spacer
              3: { fontStyle: 'bold', halign: 'right', cellWidth: 50, textColor: [22, 163, 74] },
              4: { fontStyle: 'bold', halign: 'left', fontSize: 12, textColor: [22, 163, 74] }
          }
      });

      // 7. Footer / Dipnot (Her Sayfaya)
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(normalizeForPDF("Bu belge bilgilendirme amaclidir. Resmi nitelik tasimaz."), 105, 290, { align: 'center' });
      }

      // PDF Oluştur
      const pdfBlob = doc.output('blob');
      const fileName = `odeme_plani_${amount}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({
                files: [pdfFile],
                title: 'Kredi Ödeme Planı',
                text: 'Esnaf Kefalet Kredi hesaplama detayları ekte yer almaktadır.',
            });
          } catch (err) {
            console.log("Paylaşım iptal edildi", err);
          }
      } else {
          doc.save(fileName);
          alert("Cihazınız dosya paylaşımını desteklemediği için dosya indirildi.");
      }

    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!results) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kredi Ödeme Planı - S.S. Nilüfer EKK</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              color: #1e293b; /* slate-800 */
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e2e8f0; /* slate-200 */
              padding-bottom: 20px;
            }
            
            .org-name {
              font-size: 18px;
              font-weight: 700;
              color: #059669; /* emerald-600 */
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            h2 { 
              font-size: 24px;
              color: #0f172a; /* slate-900 */
              margin: 10px 0;
            }
            
            .meta-info {
              font-size: 12px;
              color: #64748b; /* slate-500 */
              margin-top: 5px;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              background-color: #f8fafc; /* slate-50 */
              border: 1px solid #e2e8f0; /* slate-200 */
              border-radius: 8px;
              padding: 20px;
            }
            
            .summary-item {
              display: flex;
              flex-direction: column;
            }
            
            .summary-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b; /* slate-500 */
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .summary-value {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a; /* slate-900 */
            }

            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 11px; 
            }
            
            th { 
              background-color: #0f172a; /* slate-900 */
              color: white;
              padding: 10px 8px;
              text-align: right;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            th:first-child, th:nth-child(2), th:nth-child(3) {
              text-align: center;
            }
            
            td { 
              border-bottom: 1px solid #e2e8f0; /* slate-200 */
              padding: 8px; 
              text-align: right;
              color: #334155; /* slate-700 */
            }
            
            td:first-child, td:nth-child(2), td:nth-child(3) {
              text-align: center;
              color: #64748b; /* slate-500 */
            }
            
            tr:nth-child(even) { 
              background-color: #f8fafc; /* slate-50 */
            }
            
            tr:hover {
              background-color: #f1f5f9; /* slate-100 */
            }
            
            .total-row {
              background-color: #e2e8f0 !important; /* slate-200 */
              font-weight: 700;
            }
            
            .total-row td {
              border-top: 2px solid #cbd5e1; /* slate-300 */
              color: #0f172a; /* slate-900 */
              padding: 12px 8px;
            }
            
            .tfoot-label {
              text-align: right;
              padding-right: 20px;
            }

            /* Footer Kesintiler Bölümü */
            .footer-summary { 
              margin-top: 40px; 
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 0;
              overflow: hidden;
              break-inside: avoid;
            }
            
            .footer-header {
              background-color: #f1f5f9; /* slate-100 */
              padding: 10px 20px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
            }

            .deduction-row {
              display: flex;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .deduction-item {
              flex: 1;
              padding: 15px;
              text-align: center;
              border-right: 1px solid #e2e8f0;
            }
            
            .deduction-item:last-child {
              border-right: none;
            }
            
            .deduction-label {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 4px;
              display: block;
            }
            
            .deduction-value {
              font-size: 13px;
              font-weight: 600;
              color: #334155;
            }

            .net-total-row {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              padding: 15px 20px;
              background-color: #f0fdf4; /* green-50 */
              gap: 30px;
            }
            
            .total-group {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            
            .total-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 2px;
            }
            
            .total-value {
              font-size: 14px;
              font-weight: 700;
              color: #334155;
            }
            
            .net-value {
              font-size: 20px;
              color: #059669; /* emerald-600 */
            }

            @media print {
              body { padding: 0; -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="org-name">S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar<br>Kredi ve Kefalet Kooperatifi</div>
            <h2>Kredi Ödeme Planı</h2>
            <div class="meta-info">Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
          </div>
          
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Kredi Tutarı</span>
              <span class="summary-value" style="color: #059669;">${formatMoney(amount)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Vade / Dönem</span>
              <span class="summary-value">${getVadeText()}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Toplam Geri Ödeme</span>
              <span class="summary-value" style="color: #2563eb;">${formatMoney(results.totals.totalPayment)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="12%">Tarih</th>
                <th width="5%">Gün</th>
                <th>Anapara</th>
                <th>Faiz</th>
                <th>Komisyon</th>
                <th>Masraf</th>
                <th>Toplam Taksit</th>
              </tr>
            </thead>
            <tbody>
              ${results.paymentSchedule.map(row => `
                <tr>
                  <td>${row.installmentNumber}</td>
                  <td>${row.dueDate}</td>
                  <td>${row.days}</td>
                  <td>${formatMoney(row.principal)}</td>
                  <td>${formatMoney(row.interest)}</td>
                  <td>${formatMoney(row.commission)}</td>
                  <td>${formatMoney(row.expense)}</td>
                  <td style="font-weight: 700; color: #059669;">${formatMoney(row.total)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" class="tfoot-label">GENEL TOPLAMLAR</td>
                <td>${formatMoney(results.totals.principal)}</td>
                <td>${formatMoney(results.totals.interest)}</td>
                <td>${formatMoney(results.totals.commission)}</td>
                <td>${formatMoney(results.totals.expense)}</td>
                <td style="color: #059669;">${formatMoney(results.totals.totalPayment)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-summary">
            <div class="footer-header">Kesinti Detayları</div>
            <div class="deduction-row">
               <div class="deduction-item">
                  <span class="deduction-label">Peşin Masraf (%1.50)</span>
                  <span class="deduction-value">${formatMoney(results.deductions.pesinMasraf)}</span>
               </div>
               <div class="deduction-item">
                  <span class="deduction-label">Bloke Sermaye (%2.00)</span>
                  <span class="deduction-value">${formatMoney(results.deductions.blokeSermaye)}</span>
               </div>
               <div class="deduction-item">
                  <span class="deduction-label">Risk Sermayesi (%1.00)</span>
                  <span class="deduction-value">${formatMoney(results.deductions.riskSermayesi)}</span>
               </div>
               <div class="deduction-item">
                  <span class="deduction-label">TESKOMB Payı (%0.25)</span>
                  <span class="deduction-value">${formatMoney(results.deductions.teskomb)}</span>
               </div>
               <div class="deduction-item">
                  <span class="deduction-label">Bölge Birliği (%0.25)</span>
                  <span class="deduction-value">${formatMoney(results.deductions.bolgeBirligi)}</span>
               </div>
            </div>

            <div class="net-total-row">
               <div class="total-group">
                  <span class="total-label">Toplam Kesinti</span>
                  <span class="total-value" style="color: #dc2626;">- ${formatMoney(results.deductions.totalDeductions)}</span>
               </div>
               <div class="total-group">
                  <span class="total-label">Ele Geçen Net Tutar</span>
                  <span class="total-value net-value">${formatMoney(results.netAmount)}</span>
               </div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-900/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400"></div>
                    <span className="text-emerald-400 font-bold tracking-[0.25em] uppercase text-xs md:text-sm">ESNAF KEFALET</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-400"></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-2xl">
                  Kredi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-blue-500">Hesaplama</span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-light">
                  Esnaf Kefalet sistemi mevzuatına uygun, kesintiler ve değişken taksitlerin dahil olduğu detaylı hesaplama aracı.
                </p>
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="grid lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-emerald-400" />
                            Kredi Ayarları
                        </h3>
                        
                        <div className="mb-6">
                            <label className="text-sm font-medium text-slate-300 mb-3 block">Kredi Türü</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setCreditType('business')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'business' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><Briefcase size={16} /> İşletme</button>
                                <button onClick={() => setCreditType('building')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'building' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><Building2 size={16} /> İşyeri</button>
                                <button onClick={() => setCreditType('vehicle')} className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 ${creditType === 'vehicle' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><Truck size={16} /> Taşıt</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Kredi Tutarı</label>
                                <div className="relative">
                                    <input type="text" value={new Intl.NumberFormat('tr-TR').format(amount)} onChange={handleAmountChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-emerald-400 text-right focus:outline-none focus:border-emerald-500" />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₺</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Kullanım Tarihi</label>
                                <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        
                        <input type="range" min={0} max={maxAmount} step={rangeStep} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-6" />

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Vade</label>
                                <span className="text-sm font-bold text-blue-400">{getVadeText()}</span>
                            </div>
                            <input type="range" min={MIN_TERM} max={maxTerm} step={YEARLY_STEP} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div className="mb-2">
                            <label className="text-sm font-medium text-slate-300 mb-3 block">Ödeme Sıklığı</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 3, 6].map((val) => (
                                    <button key={val} onClick={() => setFrequency(val)} className={`py-2 rounded-xl text-sm font-bold border ${frequency === val ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{val === 1 ? 'Aylık' : `${val} Aylık`}</button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200 leading-relaxed">Hesaplamalar bilgilendirme amaçlıdır. Taksit tutarları değişkenlik gösterir (Eşit Anapara Yöntemi).</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    {results && (
                        <>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden group">
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">İlk Taksit Tutarı</p>
                                    <h3 className="text-3xl font-extrabold text-white mt-1">{formatMoney(results.paymentSchedule[0].total)}</h3>
                                    <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 py-1 px-3 rounded-full w-fit">
                                        <RefreshCcw size={12} /> Değişken Taksit
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 p-6 rounded-3xl relative overflow-hidden group">
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Ele Geçen Net Tutar</p>
                                    <h3 className="text-3xl font-extrabold text-white mt-1">{formatMoney(results.netAmount)}</h3>
                                    <div className="mt-3 flex items-center gap-2 text-blue-400 text-xs font-bold bg-blue-500/10 py-1 px-3 rounded-full w-fit">
                                        <Wallet size={12} /> Tüm Kesintiler Dahil
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
                                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                                    <PieChart className="w-4 h-4 text-slate-400" /> Peşin Kesinti Dökümü
                                </h4>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Peşin Masraf (%{DEFAULT_RATES.pesinMasraf})</span> <span className="text-slate-200">{formatMoney(results.deductions.pesinMasraf)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Bloke Sermaye (%{DEFAULT_RATES.blokeSermaye})</span> <span className="text-slate-200">{formatMoney(results.deductions.blokeSermaye)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Risk Sermayesi (%{DEFAULT_RATES.riskSermayesi})</span> <span className="text-slate-200">{formatMoney(results.deductions.riskSermayesi)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">TESKOMB Payı (%{DEFAULT_RATES.teskomb})</span> <span className="text-slate-200">{formatMoney(results.deductions.teskomb)}</span></div>
                                    <div className="flex justify-between text-xs col-span-2 border-t border-slate-700/50 pt-2 mt-1"><span className="text-slate-400">Bölge Birliği (%{DEFAULT_RATES.bolgeBirligi})</span> <span className="text-slate-200">{formatMoney(results.deductions.bolgeBirligi)}</span></div>
                                    <div className="flex justify-between text-sm font-bold col-span-2 text-red-400"><span className="">Toplam Kesinti</span> <span>- {formatMoney(results.deductions.totalDeductions)}</span></div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
                                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                                    <TrendingUp className="w-4 h-4 text-slate-400" /> Geri Ödeme Özeti
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Anapara</span> <span className="text-slate-200">{formatMoney(results.totals.principal)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Toplam Faiz</span> <span className="text-slate-200">{formatMoney(results.totals.interest)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Yıllık Komisyonlar (Vadeye Yayılı)</span> <span className="text-slate-200">{formatMoney(results.totals.commission)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Yıllık Masraflar (Vadeye Yayılı)</span> <span className="text-slate-200">{formatMoney(results.totals.expense)}</span></div>
                                    <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2 mt-2 text-emerald-400"><span>Toplam Geri Ödeme</span> <span>{formatMoney(results.totals.totalPayment)}</span></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
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
                <div className="mt-8 bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h3 className="text-xl font-bold text-white">Ödeme Planı</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleShare} 
                                disabled={isPdfGenerating}
                                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isPdfGenerating ? <Loader2 size={14} className="animate-spin"/> : <Share2 size={14} />} 
                                {isPdfGenerating ? 'Oluşturuluyor...' : 'PDF Paylaş / İndir'}
                            </button>
                            <button onClick={handlePrint} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                                <Printer size={14} /> Yazdır
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">Taksit</th>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Gün</th>
                                    <th className="px-4 py-3 text-right">Anapara</th>
                                    <th className="px-4 py-3 text-right">Faiz</th>
                                    <th className="px-4 py-3 text-right">Komisyon</th>
                                    <th className="px-4 py-3 text-right">Masraf</th>
                                    <th className="px-4 py-3 text-right text-white">Toplam Taksit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {results.paymentSchedule.map((row) => (
                                    <tr key={row.installmentNumber} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{row.installmentNumber}</td>
                                        <td className="px-4 py-3">{row.dueDate}</td>
                                        <td className="px-4 py-3">{row.days}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.principal)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.interest)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.commission)}</td>
                                        <td className="px-4 py-3 text-right">{formatMoney(row.expense)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{formatMoney(row.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-900/80 font-bold text-white border-t border-slate-600">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right uppercase">Toplamlar</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.principal)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.interest)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.commission)}</td>
                                    <td className="px-4 py-3 text-right">{formatMoney(results.totals.expense)}</td>
                                    <td className="px-4 py-3 text-right text-emerald-400">{formatMoney(results.totals.totalPayment)}</td>
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