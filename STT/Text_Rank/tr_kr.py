from krwordrank.word import KRWordRank
import pandas as pd
import sys
from collections import OrderedDict
import numpy as np

filename = sys.argv[1]
real = "./upload/"+filename

kor = pd.read_csv(real)
kor = kor.getPhraseText
texts = []
for i in kor:
    texts.append(i)
# texts

min_count = 2   # 단어의 최소 출현 빈도수 (그래프 생성 시)
max_length = 10  # 단어의 최대 길이
wordrank_extractor = KRWordRank(min_count=min_count, max_length=max_length)
beta = 0.85    # PageRank의 decaying factor beta
max_iter = 10
texts = texts
keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)
for word, r in sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:30]:
    print(word)
