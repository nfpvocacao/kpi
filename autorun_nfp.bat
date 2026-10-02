@echo off
echo Executando automacao NFP Analytics...
cd /d "C:\apps\kpi_nfp"

echo.
echo Executando obter_dados.py...
py "C:\apps\kpi_nfp\obter_dados.py"
if errorlevel 1 goto ERRO

echo.
echo Executando etl_import.py...
py "C:\apps\kpi_nfp\etl_import.py"
if errorlevel 1 goto ERRO

echo.
echo Processo concluido com sucesso!
goto FIM

:ERRO
echo.
echo Ocorreu um erro durante a execucao.

:FIM
pause
