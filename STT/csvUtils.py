import json
import boto3
import re
import csv
import string


def newPhrase():
	return { 'start_time': '', 'end_time': '', 'words' : [] }



def getTimeCode( seconds ):
	t_hund = int(seconds % 1 * 1000)
	t_seconds = int( seconds )
	t_secs = ((float( t_seconds) / 60) % 1) * 60
	t_mins = int( t_seconds / 60 )
	return str( "%02d:%02d:%02d,%03d" % (00, t_mins, int(t_secs), t_hund ))
	


def writeTranscriptToCSV10word( transcript, csvFileName ):
	print( "==> Creating CSV from transcript: " + csvFileName)

	phrases = getPhrasesFromTranscript10words( transcript )
	writeCSV( phrases, csvFileName )

	
	

def writeTranscriptToCSVSentence( transcript, csvFileName ):
	print( "==> Creating CSV from transcript: " + csvFileName)

	phrases = getPhrasesFromTranscriptSentence( transcript )
	writeCSV( phrases, csvFileName )


def getPhrasesFromTranscriptSentence( transcript ):

	ts = json.loads( transcript )
	items = ts['results']['items']
	
	phrase =  newPhrase()
	phrases = []
	nPhrase = True
	c = 0

	print ("==> Creating phrases from transcript...")

	for item in items:

		if nPhrase == True:
			if item["type"] == "pronunciation":
				start_time = getTimeCode( float(item["start_time"]) ).split(",")
				phrase["start_time"] = start_time[0]
				nPhrase = False
			c+= 1
		else:	
			if item["type"] == "pronunciation":
				end_time = getTimeCode( float(item["end_time"]) ).split(",")
				phrase["end_time"] = end_time[0]
				

		phrase["words"].append(item['alternatives'][0]["content"])

		#if  item['alternatives'][0]["content"] in string.punctuation: #너무 잘게 쪼개져서 endtime이 안나오는 경우 있음.
		if  item['alternatives'][0]["content"] in '.?!': 	#뭘로 쪼갤지 고민해보기
			phrases.append(phrase)
			phrase = newPhrase()
			nPhrase = True
			
	return phrases


def getPhrasesFromTranscript10words( transcript ):

	ts = json.loads( transcript )
	items = ts['results']['items']
	
	phrase =  newPhrase()
	phrases = []
	nPhrase = True
	x = 0
	c = 0

	print ("==> Creating phrases from transcript...")

	for item in items:

		if nPhrase == True:
			if item["type"] == "pronunciation":
				start_time = getTimeCode( float(item["start_time"]) ).split(",")
				phrase["start_time"] = start_time[0]
				nPhrase = False
			c+= 1
		else:	
			if item["type"] == "pronunciation":
				end_time = getTimeCode( float(item["end_time"]) ).split(",")
				phrase["end_time"] = end_time[0]
				
		phrase["words"].append(item['alternatives'][0]["content"])

		#10단어로 쪼개기
		if item['alternatives'][0]["content"] in string.punctuation:
			x = x
		else:
			x += 1

		if x == 10:
			phrases.append(phrase)
			a = phrases
			phrase = newPhrase()
			nPhrase = True
			x = 0
			
	return phrases
		

def writeCSV( phrases, filename ):
	print ("==> Writing phrases to disk...")

	e = open("./upload/"+filename, "w+", newline='', encoding = "utf-8-sig")
	wr = csv.writer(e)

	wr.writerow(['getPhraseText', 'start_time', 'end_time'])
	
	for phrase in phrases:
		out = getPhraseText( phrase )

		#print(out, phrase["start_time"], phrase["end_time"])
		#endtime 없는 것 여기서 수정
		wr.writerow([out, phrase["start_time"], phrase["end_time"]])

	e.close()

	

def getPhraseText( phrase ):

	length = len(phrase["words"])
		
	out = ""
	for i in range( 0, length ):
		if re.match( '[a-zA-Z0-9, 가-힣]', phrase["words"][i]):
			if i > 0:
				out += " " + phrase["words"][i]
			else:
				out += phrase["words"][i]
		else:
			out += phrase["words"][i]
			
	return out
	

			

	


	
	