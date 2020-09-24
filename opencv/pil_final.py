from math import *
import numpy as np
import datetime
import cv2
import skvideo.io
import dlib
import skvideo
import pandas as pd
from time import sleep
import data
import time
from PIL import ImageFont, ImageDraw, Image
import sys

video = sys.argv[1]
csv = sys.argv[2]
# 파일 불러오기
real_video = "./upload/"+video
real_csv = "./upload/"+csv


# face detector와 landmark predictor 정의
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(
    "./opencv/shape_predictor_68_face_landmarks.dat")

# 비디오 읽어오기
cap = cv2.VideoCapture(real_video)

# 데이터 프레임 가져오기
data = data.makefile(real_csv)  # 읽어올 파일

# 초당 프레임 수
fps = int(cap.get(cv2.CAP_PROP_FPS))

# 영상 저장 준비
width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
fourcc = cv2.VideoWriter_fourcc(*'DIVX')
filename = real_video
fps_save = cap.get(cv2.CAP_PROP_FPS)
out = cv2.VideoWriter(filename, fourcc, fps_save, (int(width), int(height)))


# 얼굴 범위 리스트 설정
MOUTH_OUTLINE = list(range(48, 61))
MOUTH_INNER = list(range(61, 68))
JAWLINE = list(range(0, 17))
MOUTH_INNER_TOP = list()

# 자막
text = ""
font = ImageFont.truetype("./opencv/fonts/gulim.ttf", 20)

# 각 frame마다 얼굴 찾고, landmark 찍기
while True:
    ret, frame = cap.read()
    if not ret:
        break
    img = frame

    # 현재 프레임 수
    count = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
    print(count)

    # resize할 비율 구하기
    r = 200. / img.shape[1]
    dim = (200, int(img.shape[0] * r))
    # resize 하기
    # resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
    # resize 하면 인식이 잘 안됨 / resize 안하면 처리속도 느림
    # 일단 resize안한 상태로 resized에 저장
    resized = img

    # 얼굴 detection
    rects = detector(img, 1)

    for i, rect in enumerate(rects):
        # 말풍선 가져오기
        face_mask = cv2.imread('word2.png')
        h_mask, w_mask = face_mask.shape[:2]

        # 찾은 얼굴의 박스좌표
        l = rect.left()
        t = rect.top()
        b = rect.bottom()
        r = rect.right()
        # facial landmark 찾기
        shape = predictor(resized, rect)

        # 입 움직임 비율 구하기
        left_point = (shape.part(
            MOUTH_OUTLINE[12]).x, shape.part(MOUTH_OUTLINE[12]).y)
        right_point = (shape.part(
            MOUTH_INNER[3]).x, shape.part(MOUTH_INNER[3]).y)
        center_top = (shape.part(
            MOUTH_INNER[1]).x, shape.part(MOUTH_INNER[1]).y)
        center_bottom = (shape.part(
            MOUTH_INNER[5]).x, shape.part(MOUTH_INNER[5]).y)
        hor_line = cv2.line(resized, left_point, right_point, (0, 255, 0), 2)
        ver_line = cv2.line(resized, center_top, center_bottom, (0, 255, 0), 2)
        hor_line_lenght = hypot(
            (left_point[0] - right_point[0]), (left_point[1] - right_point[1]))
        ver_line_lenght = hypot(
            (center_top[0] - center_bottom[0]), (center_top[1] - center_bottom[1]))
        # 입을 벌릴수록 ratio 값 작아짐
        # 입 다물고있지 않으면 (말하고 있으면)
        if ver_line_lenght != 0:
            ratio = hor_line_lenght*1.5 / ver_line_lenght
        else:
            ratio = 60

        # facial landmark를 빨간색 점으로 찍어서 표현
        for j in range(68):
            x, y = shape.part(j).x, shape.part(j).y
            cv2.circle(resized, (x, y), 1, (0, 0, 255), -1)

        # 말하고 있는지 판별하기
        if (ratio < 50 and ratio > 3):
            if(ratio >= 38 and ratio <= 42):
                ratio = ratio
            elif (ratio > 26 and ratio <= 29):
                ratio = ratio
            else:
                re_ratio = str(round(ratio, 2))

                # 말풍선을 띄우기 위해 새로 정의한 좌표
                x = int(l-0.5*(r-l))
                y = int(t+1.2*(b-t))
                w = int(2.3*(r-l))  # int(2.6*(r-l))
                h = int(1.3*(b-t))  # int(1.5*(b - t))

                # 말풍선 위치할 좌표
                word_x = int(x+(w*0.05))
                word_y = int(y+(h*0.25))

                # 자막 처리
                pill_image = Image.fromarray(face_mask)
                draw = ImageDraw.Draw(pill_image)

                # 자막 넣기
                num = len(data)
                for n in range(0, num):
                    # 자막이 해당 시간안에 들어오는지 터미널로 확인
                    print("-------------------------")
                    print(int(float(data['start'][n])) * fps)
                    print(count)
                    print(int(float(data['end'][n])) * fps)
                    print("-------------------------")
                    # 자막이 해당 시간안에 들어오면
                    if int(float(data['start'][n]))*fps <= count & count < int(float(data['end'][n]))*fps:
                        text = data['textSplit'][n]
                        draw.text((30, 40), text, font=font,
                                  fill=(0, 0, 0))
                        face_mask = np.array(pill_image)
                    print("*************************")

                # 말풍선이미지 처리
                rows, cols, chammels = face_mask.shape
                # frame 얼굴에 맞춰서 자르기
                frame_roi = resized[y: y + h, x: x + w]
                # 마스크 크기 조절
                face_mask_small = cv2.resize(
                    face_mask, (w, h), interpolation=cv2.INTER_AREA)
                # 그레이 마스크
                gray_mask = cv2.cvtColor(
                    face_mask_small, cv2.COLOR_BGR2GRAY)
                # 바탕이 검은색인 마스크를 만듦
                ret, mask = cv2.threshold(
                    gray_mask, 240, 255, cv2.THRESH_BINARY_INV)
                mask_inv = cv2.bitwise_not(mask)
                masked_face = cv2.bitwise_and(
                    face_mask_small, face_mask_small, mask=mask)
                masked_frame = cv2.bitwise_and(
                    frame_roi, frame_roi, mask=mask_inv)
                cv2.imshow('frame_roi', frame)
                # 이미지처리 완료한 이미지를 프레임에 씌운다.
                resized[y: y + h, x: x +
                        w] = cv2.add(masked_face, masked_frame)

        # 처리된 이미지 보여주기
        cv2.imshow('frame', resized)
        out.write(resized)
        count += 1
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
cv2.destroyAllWindows()
skvideo.io.vwrite(real_video, resized)
