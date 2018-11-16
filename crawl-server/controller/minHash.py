# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.cluster import KMeans
# from sklearn.metrics import adjusted_rand_score
import sys

# documents = ["This little kitty came to play when I was eating at a restaurant.",
#              "Merley has the best squooshy kitten belly.",
#              "Google Translate app is incredible.",
#              "If you open 100 tab in google you get a smiley face.",
#              "Best cat photo I've ever taken.",
#              "Climbing ninja cat.",
#              "Impressed with google map feedback.",
#              "Key promoter extension for Google Chrome."]

# vectorizer = TfidfVectorizer(stop_words='english')
# X = vectorizer.fit_transform(documents)

# true_k =5
# model = KMeans(n_clusters=true_k, init='k-means++', max_iter=100, n_init=1)
# model.fit(X)

# print("Top terms per cluster:")
# order_centroids = model.cluster_centers_.argsort()[:, ::-1]
# terms = vectorizer.get_feature_names()
# for i in range(true_k):
#     print("Cluster %d:" % i),
#     for ind in order_centroids[i, :10]:
#         print(' %s' % terms[ind]),
#     print

# print(len(sys.argv))
# print(str(sys.argv[1]))

from datasketch import MinHash, MinHashLSH

file = sys.path[0] + '/temp.txt'

f = open(file, errors='ignore')
lines = [line for line in f.readlines()]
f.close()

# s1 = "#FoodICantLiveWithout\n1) Curry\n2) Chocolate\n3) Pot Noodles\n4) Spaghetti\n5) Anti-Depressants"
# s2 = "Hello, is it me the cops are looking for?ðŸ‘€ #SongsAsVoicemail"
# s3 = "@oldishrockchick @MetalMacGyver @goc1978 @bigtim134 @loinclothnation @PiIrwin @Pedro1964va @davenunn64 @Punxvillanâ€¦ https://t.co/6ML3XHd2q8"
# s4 = "#SongsAsVoicemail\nI get knocked down\nBut I get up again\nHave you had an accident at work?"
# s5 = "@ehlayy Youâ€™re so cool"
# s6 = "Jack the Zipper! #FilmsInsideBoxes"
# s7 = "I am struggling without you I don't know how much longer I can pretend I'm not https://t.co/AyFO8ldA6y"
# s8 = "broken clouds -&gt; light rain\ntemperature down 13Â°C -&gt; 9Â°C\nhumidity up 82% -&gt; 87%\nwind 5kmh -&gt; 3kmh"
# s9 = "Hutch Ado About Nothing. #FilmsInsideBoxes"
# s10 = "@super_thornlie"
# sentences = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10]
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
    # print()
    # print()
    # print("eachM ", "==>", len(result))

print('Final Count: ', finalCount)