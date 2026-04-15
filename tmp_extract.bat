@echo off
findstr /n "_generatePDFBlob" "D:\Documentos\Projetos Apps\Orçamento_Pintor_Plus\pintor-plus\app_script.js" > temp_line_numbers.txt
for /f "tokens=1 delims=:" %%i in (temp_line_numbers.txt) do (
  echo Found _generatePDFBlob at line %%i
  powershell -Command "(Get-Content 'D:\Documentos\Projetos Apps\Orçamento_Pintor_Plus\pintor-plus\app_script.js')[%%i-2,%%i-1,%%i,%%i+1,%%i+2,%%i+3,%%i+4,%%i+5,%%i+6,%%i+7,%%i+8,%%i+9,%%i+10,%%i+11,%%i+12,%%i+13,%%i+14,%%i+15,%%i+16,%%i+17,%%i+18,%%i+19,%%i+20,%%i+21,%%i+22,%%i+23,%%i+24,%%i+25,%%i+26,%%i+27,%%i+28,%%i+29,%%i+30]" > temp_pdf_function.txt
)
type temp_pdf_function.txt