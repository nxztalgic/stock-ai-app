

import tweepy
from transformers import pipeline
import matplotlib.pyplot as plt
from collections import Counter
from io import BytesIO
import base64


bearer_token = "AAAAAAAAAAAAAAAAAAAAADtF2wEAAAAAg0uRKVTnlML%2Bx4nUBRCMNF6d95o%3DkBoWbh0UdwVibHbn03bTNMfol2wgql3CWPGSr8zYVFyhWHTNDE"  # Replace with your actual key
client = tweepy.Client(bearer_token=bearer_token)


sentiment_model = pipeline("sentiment-analysis")


def get_tweets(stock_name, max_tweets=30):
    try:
        tweets = client.search_recent_tweets(query=stock_name, max_results=max_tweets, tweet_fields=['text', 'lang'])
        return [tweet.text for tweet in tweets.data if tweet.lang == 'en']
    except tweepy.TooManyRequests:
        print("⚠️ Rate limit hit.")
        return []
    except Exception as e:
        print("❌ Error:", e)
        return []


def run_sentiment(stock_name):
    tweets = get_tweets(stock_name, max_tweets=30)
    if not tweets:
        return None, None, None 

    sentiments = sentiment_model(tweets)


    labels = [s['label'] for s in sentiments]
    counts = Counter(labels)


    plt.figure(figsize=(6,6))
    plt.pie(counts.values(), labels=counts.keys(), autopct='%1.1f%%', colors=['green', 'red', 'gold'])
    plt.title(f'Sentiment for {stock_name}')

    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    chart_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close()


    summary = {label: count for label, count in counts.items()}
    return summary, len(tweets), chart_base64
