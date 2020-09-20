import boto3
import uuid
import requests


def createTranscribeJob( region, bucket, mediaFile ):

	lang = "en-US"
	if bucket == "en-us":
		lang ="en-US"
	elif bucket == "ko-kr":
		lang="ko-KR"

	transcribe = boto3.client('transcribe')
	
	mediaUri = "https://" + "wordballoon.s3." + region + ".amazonaws.com/" + bucket + "/" + mediaFile 
	
	print( "Creating Job: " + "transcribe " + mediaFile + " for " + mediaUri )
	
	#response = transcribe.start_transcription_job( TranscriptionJobName="transcribe_" + uuid.uuid4().hex + "_" + mediaFile , \		# 난수값 제목
	response = transcribe.start_transcription_job( 
		TranscriptionJobName= mediaFile , \
		LanguageCode = lang, \
		MediaFormat = "mp4", \
		Media = { "MediaFileUri" : mediaUri }, \
		)
	
	return response
	
	

def getTranscriptionJobStatus( jobName ):
	transcribe = boto3.client('transcribe')
	
	response = transcribe.get_transcription_job( TranscriptionJobName=jobName )
	return response
	
	

def getTranscript( transcriptURI ):
	result = requests.get( transcriptURI )

	return result.text

	