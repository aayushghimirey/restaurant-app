@echo off
git branch -M main
git remote add origin https://github.com/aayushghimirey/restaurant-app.git
git remote set-url origin https://github.com/aayushghimirey/restaurant-app.git
git add .
git commit -m "Modernized Finance, Purchase, and Order modules UI/UX; added unified Vendor and Variant searching."
git push -u origin main
