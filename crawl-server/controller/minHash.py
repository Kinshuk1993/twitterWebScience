import sys
from datasketch import MinHash, MinHashLSH
import pandas as pd
import csv

file = sys.path[0] + '/tweetTexts.txt'
line_count = 0

# f = open(file, errors='ignore')
# lines = [line for line in f.readlines()]
# f.close()
lines = []

with open(file, encoding='utf-8') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter='>')
    for row in csv_reader:
        line_count += 1
        lines.append(row)

# print("Line count: ", line_count)

counter = 0
lsh = MinHashLSH(threshold=0.5, num_perm=256)
m = []

for s in lines:
    m.append(MinHash(num_perm=256))
    for d in s:
        m[counter].update(d.encode('utf8'))
    lsh.insert(f'm{counter}', m[counter])
    counter = counter + 1

finalCount = 0
for eachM in m:
    result = lsh.query(eachM)
    finalCount += 1
    # print("eachM ", "==>", len(result))

print('Final Count: ', finalCount)