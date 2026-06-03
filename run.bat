@echo off
title Serveur Local - Enquete Patrimoine Cinémas Safi
echo =====================================================================
echo    ROYAUME DU MAROC - MASTER SCIENCES DE L'INFORMATION ET COM
echo        Plateforme d'enquête locale et Analyse Statistique
echo =====================================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Python pour lancer cette application localement.
    pause
    exit /b 1
)

:: Create Virtual Environment if not exists
if not exist venv (
    echo [SETUP] Creation de l'environnement virtuel venv...
    python -m venv venv
    if errorlevel 1 (
        echo [ERREUR] Impossible de creer l'environnement virtuel.
        pause
        exit /b 1
    )
)

:: Activate Virtual Environment
echo [SETUP] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

:: Install Requirements
echo [SETUP] Installation des dependances (Flask, Pandas, ReportLab, etc.)...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERREUR] Echec de l'installation des dependances.
    pause
    exit /b 1
)

:: Download JS libraries for offline mode
echo [SETUP] Telechargement des dependances JS pour le mode offline...
python download_assets.py

:: Initialize and seed SQLite database
echo [SETUP] Initialisation et remplissage de la base de donnees...
python seed.py

:: Start server and open browser
echo.
echo [LANCEMENT] Demarrage de l'application sur http://localhost:5000 ...
echo [INFO] Pour arreter le serveur, fermez cette fenetre CMD ou appuyez sur Ctrl+C.
echo.

:: Delay opening the browser slightly to let Flask boot
start "" "http://localhost:5000"
python app.py

pause
