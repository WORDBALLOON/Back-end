# word라는 배열로 키워드 받아온 후, split
import sys
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
import base64

# %matplotlib inline

words = sys.argv[1]
words.replace(",", "/")
wordlist = words.split('/')

def displayWordCloud(data=None, backgroundcolor='white', width=800, height=600):
    wordcloud = WordCloud(stopwords=STOPWORDS,
                          background_color=backgroundcolor,
                          width=width, height=height).generate(data)
    plt.figure(figsize=(15, 10))
    plt.imshow(wordcloud)
    plt.axis("off")
    wordcloud.to_file('./upload/wordcloud.jpg')


# 워드 클라우드 제작 후 파일로 저장
displayWordCloud(' '.join(wordlist))