#!/bin/bash
# =====================================================================
# DealFlow Start Script - Telegram & WhatsApp Broadcasting Engine
# =====================================================================

echo "Stopping any existing bot or API processes..."
pkill -f "python3 bot.py"
pkill -f "python3 desidime_bot.py"
pkill -f "python3 api.py"
sleep 2

echo "Starting API Server (api.py)..."
nohup python3 api.py > api.log 2>&1 &

echo "Starting DesiDime Scraper (desidime_bot.py)..."
nohup python3 desidime_bot.py > desidime_bot.log 2>&1 &

echo "Starting Main Deal Bot (bot.py)..."
nohup python3 bot.py > bot.log 2>&1 &

sleep 2
echo "====================================================================="
echo "Active Running Services:"
ps aux | grep -E "bot\.py|desidime_bot\.py|api\.py" | grep -v grep
echo "====================================================================="
echo "✅ All DealFlow services started successfully!"
