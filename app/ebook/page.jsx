import React from 'react';

export default function Ebook() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 print:bg-white print:py-0 font-sans text-[#172033]">
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break-after {
            page-break-after: always;
            break-after: page;
          }
        }
      `}} />

      {/* PAGE 01 — COVER */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after">
        <div className="p-16 flex-1 flex flex-col mt-12">
          <div className="mb-24">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#2563EB] mb-2">TUMBUH</h1>
          </div>
          
          <div className="max-w-2xl z-10 mb-16">
            <h2 className="text-6xl font-bold tracking-tight text-[#172033] leading-[1.1] mb-8">
              Kelola Uang.<br/>
              Bangun Kebiasaan.<br/>
              Capai Tujuan.
            </h2>
            <p className="text-2xl text-[#64748B] font-light leading-snug">
              Keuangan lebih terarah, mulai dari kebiasaan kecil.
            </p>
          </div>
          
          <div className="mt-auto relative w-full flex justify-center items-end">
            <div className="w-[320px] rounded-t-[40px] overflow-hidden bg-white border-[8px] border-slate-800 border-b-0 shadow-2xl relative translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-[20px] z-10"></div>
              {/* Menggunakan Screenshot Mobile untuk Sampul agar proposional vertikal */}
              <img src="/ebook-assets/image copy 3.png" alt="Tumbuh Dashboard Mobile" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 02 — INTRODUCTION */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-24">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">02 / Pengantar</span>
        </div>
        
        <div className="max-w-xl mb-16">
          <h2 className="text-4xl font-bold text-[#172033] mb-8 tracking-tight">Kenalan dengan Tumbuh</h2>
          <p className="text-xl text-[#64748B] leading-relaxed font-light">
            Tumbuh adalah aplikasi pengelolaan keuangan yang membantu kamu mencatat transaksi, mengatur anggaran, membangun tabungan, dan memantau perjalanan menuju tujuan finansial.
          </p>
        </div>
        
        <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white mt-auto">
          {/* Screenshot Desktop natural */}
          <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          </div>
          <img src="/ebook-assets/image copy 2.png" alt="Dashboard Desktop" className="w-full h-auto block" />
        </div>
      </div>

      {/* PAGE 03 — THE IDEA */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#2563EB] text-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16 justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-bold leading-[1.2] tracking-tight mb-12">
            "Perubahan finansial tidak harus dimulai dari langkah besar."
          </h2>
          <p className="text-2xl font-light text-[#EFF6FF] leading-relaxed">
            Dengan kebiasaan kecil yang dilakukan secara konsisten, perjalanan menuju tujuan finansial menjadi lebih terarah.
          </p>
        </div>
      </div>

      {/* PAGE 04 — FOUR CORE FEATURES */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-24">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">04 / Fitur Inti</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-24 tracking-tight max-w-lg leading-tight">
          Semua yang Kamu Butuhkan untuk Mengelola Keuangan
        </h2>
        
        <div className="space-y-16">
          <div className="flex items-start gap-8 border-t border-slate-100 pt-8">
            <span className="text-lg font-mono text-[#64748B]">01</span>
            <div>
              <h3 className="text-2xl font-semibold text-[#172033] mb-3">Catat Transaksi</h3>
              <p className="text-lg text-[#64748B] font-light">Catat pemasukan dan pengeluaran dengan rapi.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 border-t border-slate-100 pt-8">
            <span className="text-lg font-mono text-[#64748B]">02</span>
            <div>
              <h3 className="text-2xl font-semibold text-[#172033] mb-3">Atur Anggaran</h3>
              <p className="text-lg text-[#64748B] font-light">Tentukan batas pengeluaran dan pantau penggunaannya.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 border-t border-slate-100 pt-8">
            <span className="text-lg font-mono text-[#64748B]">03</span>
            <div>
              <h3 className="text-2xl font-semibold text-[#172033] mb-3">Target Tabungan</h3>
              <p className="text-lg text-[#64748B] font-light">Tentukan tujuan dan lihat perkembangan tabungan.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 border-t border-slate-100 pt-8 border-b pb-8">
            <span className="text-lg font-mono text-[#64748B]">04</span>
            <div>
              <h3 className="text-2xl font-semibold text-[#172033] mb-3">Pantau Progress</h3>
              <p className="text-lg text-[#64748B] font-light">Lihat perjalanan keuangan dalam satu tampilan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 05 — DASHBOARD */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-16">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">05 / Dashboard</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-12 tracking-tight">Semua Informasi Penting,<br/>Sekilas Pandang</h2>
        
        <div className="w-full flex-1">
          <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm relative">
            <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </div>
            {/* Screenshot Dashboard tidak dipotong */}
            <img src="/ebook-assets/image copy 2.png" alt="Dashboard" className="w-full h-auto block" />
            
            {/* Annotations */}
            <div className="absolute top-[20%] left-[-10px] flex items-center gap-3">
              <span className="text-xs font-medium text-[#172033] bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm whitespace-nowrap">Total Tabungan</span>
              <div className="w-2 h-2 rounded-full bg-[#2563EB]"></div>
            </div>
            
            <div className="absolute top-[35%] right-[-10px] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
              <span className="text-xs font-medium text-[#172033] bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm whitespace-nowrap">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 06 — TRANSACTIONS */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-16">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">06 / Transaksi</span>
        </div>
        
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-bold text-[#172033] tracking-tight">Catat Setiap<br/>Pergerakan Uang</h2>
          <p className="text-lg text-[#64748B] font-light max-w-sm text-right">
            Semua pemasukan dan pengeluaran tercatat dalam satu riwayat yang mudah ditinjau.
          </p>
        </div>
        
        <div className="flex gap-12 items-start flex-1">
          <div className="w-[30%] space-y-6 pt-16">
            <div className="border-l border-slate-300 pl-4 py-1">
              <p className="text-[#172033] font-medium text-sm">Pemasukan</p>
            </div>
            <div className="border-l border-slate-300 pl-4 py-1">
              <p className="text-[#172033] font-medium text-sm">Pengeluaran</p>
            </div>
            <div className="border-l border-slate-300 pl-4 py-1">
              <p className="text-[#172033] font-medium text-sm">Tanggal</p>
            </div>
            <div className="border-l border-slate-300 pl-4 py-1">
              <p className="text-[#172033] font-medium text-sm">Kategori</p>
            </div>
            <div className="border-l border-slate-300 pl-4 py-1">
              <p className="text-[#172033] font-medium text-sm">Pencarian transaksi</p>
            </div>
          </div>
          <div className="w-[70%]">
             <div className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                {/* Natural aspect ratio */}
                <img src="/ebook-assets/image copy 4.png" alt="Transactions Desktop" className="w-full h-auto block" />
             </div>
          </div>
        </div>
      </div>

      {/* PAGE 07 — MONTHLY BUDGET */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-16">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">07 / Anggaran Bulanan</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-16 tracking-tight">Buat Anggaran yang Realistis</h2>
        
        <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white mb-12">
          <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          </div>
          <img src="/ebook-assets/image copy 4.png" alt="Anggaran Bulanan" className="w-full h-auto block" />
        </div>
        
        <div className="grid grid-cols-2 gap-12 mt-auto">
          <div>
            <p className="text-sm text-[#64748B] mb-2 font-medium">Batas Aman</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <p className="text-sm text-[#172033]">Total pengeluaran di bawah batas anggaran.</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-2 font-medium">Peringatan</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#E11D48]"></div>
              <p className="text-sm text-[#172033]">Total pengeluaran mendekati atau melebihi batas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 08 — SAVINGS TARGET */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-16">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">08 / Target & Impian</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-12 tracking-tight">Ubah Keinginan Menjadi Target</h2>
        
        <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white mb-12">
          <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          </div>
          <img src="/ebook-assets/image copy 10.png" alt="Target Tabungan" className="w-full h-auto block" />
        </div>
        
        <div className="grid grid-cols-5 gap-6 mt-auto border-t border-slate-100 pt-8">
          <div>
            <p className="text-xs text-[#64748B] mb-1 font-mono">01</p>
            <p className="text-sm text-[#172033] font-medium leading-snug">Target utama</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1 font-mono">02</p>
            <p className="text-sm text-[#172033] font-medium leading-snug">Jumlah terkumpul</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1 font-mono">03</p>
            <p className="text-sm text-[#172033] font-medium leading-snug">Sisa target</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1 font-mono">04</p>
            <p className="text-sm text-[#172033] font-medium leading-snug">Periode</p>
          </div>
          <div>
            <p className="text-xs text-[#10B981] mb-1 font-mono">05</p>
            <p className="text-sm text-[#172033] font-medium leading-snug">Progress</p>
          </div>
        </div>
      </div>

      {/* PAGE 09 — MILESTONES */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-32">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">09 / Milestones</span>
        </div>
        
        <div className="max-w-2xl mb-32">
          <h2 className="text-4xl font-bold text-[#172033] mb-8 tracking-tight">Rayakan Setiap Progress</h2>
          <p className="text-xl text-[#64748B] leading-relaxed font-light">
            Tumbuh membagi perjalanan menuju target menjadi beberapa tahapan agar progress terasa lebih nyata.
          </p>
        </div>
        
        <div className="mt-auto pb-32 px-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-300 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/2 h-[1px] bg-[#10B981] -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white text-[10px] font-medium shadow-sm mb-4">
                ✓
              </div>
              <span className="text-sm font-medium text-[#172033]">25%</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white text-[10px] font-medium shadow-sm mb-4">
                ✓
              </div>
              <span className="text-sm font-medium text-[#172033]">50%</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#10B981] flex items-center justify-center text-[#10B981] mb-4">
                <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
              </div>
              <span className="text-sm font-medium text-[#172033]">75%</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 mb-4"></div>
              <span className="text-sm font-medium text-[#64748B]">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 10 — FINANCIAL HABITS */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-24">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">10 / Kebiasaan Finansial</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-24 tracking-tight">Kebiasaan Kecil, Dampak Besar</h2>
        
        <div className="flex flex-col gap-12 max-w-3xl">
          <div className="flex items-start gap-12 border-t border-slate-100 pt-8">
            <span className="text-2xl font-mono text-[#64748B] pt-1">01</span>
            <p className="text-3xl text-[#172033] font-light leading-snug">
              Catat transaksi secara rutin.
            </p>
          </div>
          
          <div className="flex items-start gap-12 border-t border-slate-100 pt-8">
            <span className="text-2xl font-mono text-[#64748B] pt-1">02</span>
            <p className="text-3xl text-[#172033] font-light leading-snug">
              Tetapkan batas pengeluaran.
            </p>
          </div>
          
          <div className="flex items-start gap-12 border-t border-slate-100 pt-8">
            <span className="text-2xl font-mono text-[#64748B] pt-1">03</span>
            <p className="text-3xl text-[#172033] font-light leading-snug">
              Sisihkan uang untuk tujuan.
            </p>
          </div>
          
          <div className="flex items-start gap-12 border-t border-slate-100 pt-8 border-b border-slate-100 pb-8">
            <span className="text-2xl font-mono text-[#64748B] pt-1">04</span>
            <p className="text-3xl text-[#172033] font-light leading-snug">
              Evaluasi progress secara berkala.
            </p>
          </div>
        </div>
      </div>

      {/* PAGE 11 — HOW TO START */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16 justify-center">
        <h2 className="text-4xl font-bold text-[#172033] mb-24 tracking-tight text-center">Mulai dalam 4 Langkah</h2>
        
        <div className="max-w-xl mx-auto space-y-16 relative">
          <div className="absolute top-4 bottom-4 left-[15px] w-[1px] bg-slate-300 z-0"></div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-8 h-8 bg-white border border-slate-300 rounded-full flex items-center justify-center text-xs font-mono text-[#172033]">01</div>
            <p className="text-2xl text-[#172033] font-light">Catat kondisi keuangan</p>
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-8 h-8 bg-white border border-slate-300 rounded-full flex items-center justify-center text-xs font-mono text-[#172033]">02</div>
            <p className="text-2xl text-[#172033] font-light">Tentukan target</p>
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-8 h-8 bg-white border border-slate-300 rounded-full flex items-center justify-center text-xs font-mono text-[#172033]">03</div>
            <p className="text-2xl text-[#172033] font-light">Atur anggaran</p>
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-8 h-8 bg-[#2563EB] border border-[#2563EB] rounded-full flex items-center justify-center text-xs font-mono text-white">04</div>
            <p className="text-2xl text-[#172033] font-light">Pantau progress</p>
          </div>
        </div>
      </div>

      {/* PAGE 12 — PRODUCT PHILOSOPHY */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16 justify-center items-center">
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl font-bold text-[#172033] mb-12 tracking-tight leading-[1.2]">
            "Tidak harus sempurna.<br/>Yang penting terus bertumbuh."
          </h2>
          <p className="text-xl text-[#64748B] font-light leading-relaxed max-w-xl mx-auto">
            Tumbuh membantu membuat perjalanan finansial terasa lebih sederhana, terarah, dan konsisten.
          </p>
        </div>
      </div>

      {/* PAGE 13 — WHY TUMBUH */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#F8FAFC] mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="mb-24">
          <span className="text-sm font-semibold tracking-widest text-[#64748B] uppercase">13 / Filosofi</span>
        </div>
        
        <h2 className="text-4xl font-bold text-[#172033] mb-20 tracking-tight">Dibuat untuk Perjalanan Finansial Sehari-hari</h2>
        
        <div className="grid grid-cols-3 gap-12 border-t border-slate-200 pt-12 mb-16">
          <div>
            <h3 className="text-lg font-medium text-[#172033] mb-3">Sederhana</h3>
            <p className="text-sm text-[#64748B] font-light leading-relaxed">Informasi penting tanpa kerumitan.</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#172033] mb-3">Terarah</h3>
            <p className="text-sm text-[#64748B] font-light leading-relaxed">Target dan anggaran membantu menjaga fokus.</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#172033] mb-3">Konsisten</h3>
            <p className="text-sm text-[#64748B] font-light leading-relaxed">Kebiasaan kecil yang dilakukan terus-menerus.</p>
          </div>
        </div>
        
        <div className="mt-auto w-full rounded-t-xl overflow-hidden border border-slate-200 border-b-0 shadow-sm bg-white">
          <div className="w-full h-6 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          </div>
          {/* Natural layout mapping */}
          <img src="/ebook-assets/image copy 2.png" alt="Tumbuh UI" className="w-full h-auto block" />
        </div>
      </div>

      {/* PAGE 14 — FINAL CTA */}
      <div className="w-[210mm] h-[297mm] mx-auto bg-[#172033] text-white mb-10 print:mb-0 relative overflow-hidden flex flex-col page-break-after p-16">
        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <h2 className="text-6xl font-bold mb-8 tracking-tight leading-tight">Siap Mulai Tumbuh?</h2>
          <p className="text-2xl text-[#64748B] font-light leading-relaxed mb-16">
            Kelola uang dengan lebih terarah, bangun kebiasaan yang lebih baik, dan capai tujuan finansialmu sedikit demi sedikit.
          </p>
          
          <div className="inline-flex items-center text-lg font-medium text-[#2563EB] hover:text-white transition-colors cursor-pointer border-b border-[#2563EB] hover:border-white pb-1 w-max">
            Mulai Tumbuh Sekarang &rarr;
          </div>
        </div>
        
        <div className="mt-auto flex justify-between items-end border-t border-slate-800 pt-12">
          <div className="text-2xl font-bold tracking-tight text-white">TUMBUH</div>
          
          <div className="w-[240px] rounded-t-[32px] overflow-hidden bg-slate-900 border-t border-l border-r border-slate-800 translate-y-16 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-[16px] z-10"></div>
            <img src="/ebook-assets/image copy 3.png" alt="Tumbuh Mobile" className="w-full h-auto block opacity-90" />
          </div>
        </div>
      </div>

    </div>
  );
}
