import moviepy.editor as mp
import sys

title = sys.argv[1]
mp4_title = title+".mp4"
mp3_title = title+".mp3"

clip = mp.VideoFileClip("./upload/"+mp4_title)
clip.audio.write_audiofile("./upload/"+mp3_title)
