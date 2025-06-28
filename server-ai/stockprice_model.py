
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
from datetime import timedelta
import io
import base64
import os 

def run_prediction(ticker):

    df = yf.download(ticker, period='5y').reset_index()
    if df.empty:
        return {"error": f"No data found for {ticker}."}

    close_prices = df['Close'].values.reshape(-1, 1)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(close_prices)

    model = load_model('keras_model.weights.h5')

    last_100_days = scaled_data[-100:]
    temp_input = list(last_100_days.flatten())
    predicted_scaled = []

    for _ in range(30):
        if len(temp_input) > 100:
            temp_input = temp_input[1:]
        input_arr = np.array(temp_input).reshape(1, 100, 1)
        pred = model.predict(input_arr, verbose=0)
        temp_input.append(pred[0][0])
        predicted_scaled.append(pred[0][0])

    predicted_prices = scaler.inverse_transform(
        np.array(predicted_scaled).reshape(-1, 1)
    ).flatten()

    last_date = df['Date'].iloc[-1]
    if isinstance(last_date, pd.Timestamp):
        last_date = last_date.to_pydatetime()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(30)]

  
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df['Date'], close_prices, label='Historical Close')
    ax.plot(future_dates, predicted_prices, label='Predicted Next 30 Days', linestyle='--')
    ax.set_xlabel('Date')
    ax.set_ylabel('Price')
    ax.set_title(f'{ticker} Stock Prediction')
    ax.legend()
    ax.grid(True)

    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')

    today_price = close_prices[-1][0]
    final_forecast = predicted_prices[-1]
    trend = "UP" if final_forecast > today_price else "DOWN"

    return {
        'ticker': ticker.upper(),
        'today_price': float(today_price),
        'predicted_30th_day': float(final_forecast),
        'trend': f"Expected to go {trend} compared to today.",
        'chart_base64': img_base64
    }


