import cv2
import numpy as np
import moviepy.editor as mp
from moviepy.editor import *
import sys

title = sys.argv[1]
mp4_title = title+".mp4"
mp3_title = title+".mp3"

videoclip = VideoFileClip("./upload/novoice("+title+").mp4")
audioclip = AudioFileClip("./upload/"+mp3_title)

videoclip.audio = audioclip
videoclip.write_videofile("./upload/"+mp4_title)

print(mp4_title)
