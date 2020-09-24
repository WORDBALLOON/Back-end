# stt 메인파일

from transcribeUtils import *
from csvUtils import *
import time
import boto3
import sys


def startSTT(inbucket, infilename):
    s3 = boto3.client('s3')

    inbucket = inbucket  # "en-us" "ko-kr"
    infilename = infilename  # "video_us2"
    filetype = ".mp4"

    print("==> StartSTT\n")
    print("==> Parameters: ")
    print("\tInput bucket/object: " + inbucket + "/" + infilename + filetype)

    # transcription 생성
    response = createTranscribeJob(
        "ap-northeast-2", inbucket, infilename+filetype)

    print("\n==> Transcription Job: " +
          response["TranscriptionJob"]["TranscriptionJobName"] + "\n\tIn Progress"),
    while(response["TranscriptionJob"]["TranscriptionJobStatus"] == "IN_PROGRESS"):
        print("."),
        time.sleep(30)
        response = getTranscriptionJobStatus(
            response["TranscriptionJob"]["TranscriptionJobName"])

    print("\nJob Complete")
    print("\tStart Time: " + str(response["TranscriptionJob"]["CreationTime"]))
    print("\tEnd Time: " + str(response["TranscriptionJob"]["CompletionTime"]))
    print("\tTranscript URI: " +
          str(response["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]))  # json 파일 위치

    # Now get the transcript JSON from AWS Transcribe
    transcript = getTranscript(
        str(response["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]))

    # 자막 스크립트 csv 파일로 저장
    csvsentence = infilename + ".csv"
    writeTranscriptToCSVSentence(transcript, csvsentence)  # textrank

    # 자막 스크립트 csv 파일 s3에 업로드
    s3.upload_file("./upload/"+csvsentence, "wordballooncsv", csvsentence)


inbucket = sys.argv[1]
pvideotitle = sys.argv[2]


startSTT(inbucket, pvideotitle)
