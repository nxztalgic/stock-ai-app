
from flask import Flask, render_template, request
from stockprice_model import run_prediction
from sentiment import run_sentiment  
app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    ticker = request.form.get('ticker')
    result = run_prediction(ticker)
    return render_template('index.html', result=result)


@app.route('/sentiment', methods=['GET', 'POST'])
def sentiment():
    if request.method == 'POST':
        stock_name = request.form.get('stock_name')
        summary, total_tweets, chart_base64 = run_sentiment(stock_name)
        if summary is None:
            result = {
                'stock_name': stock_name,
                'error': 'No tweets found or Twitter API limit hit.'
            }
        else:
            result = {
                'stock_name': stock_name,
                'summary': summary,
                'total_tweets': total_tweets,
                'chart_base64': chart_base64
            }
        return render_template('sentiment.html', result=result)
    else:
        return render_template('sentiment.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
