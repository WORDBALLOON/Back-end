# mouth.search_mouth()로 호출
# shape : facial landmark 찾기

import cv2
from math import *


def search_mouth(shape, resized):

    # 얼굴 범위 리스트 설정
    MOUTH_OUTLINE = list(range(48, 61))
    MOUTH_INNER = list(range(61, 68))
    JAWLINE = list(range(0, 17))
    MOUTH_INNER_TOP = list()

    # 입 움직임 비율 구하기
    left_point = (shape.part(
        MOUTH_OUTLINE[12]).x, shape.part(MOUTH_OUTLINE[12]).y)
    right_point = (shape.part(
        MOUTH_INNER[3]).x, shape.part(MOUTH_INNER[3]).y)
    center_top = (shape.part(
        MOUTH_INNER[1]).x, shape.part(MOUTH_INNER[1]).y)
    center_bottom = (shape.part(
        MOUTH_INNER[5]).x, shape.part(MOUTH_INNER[5]).y)
    hor_line_lenght = hypot(
        (left_point[0] - right_point[0]), (left_point[1] - right_point[1]))
    ver_line_lenght = hypot(
        (center_top[0] - center_bottom[0]), (center_top[1] - center_bottom[1]))

    # 입술의 가로 세로 초록색 선으로 표현 (입술 인식 확인용)
    hor_line = cv2.line(resized, left_point, right_point, (0, 255, 0), 2)
    ver_line = cv2.line(resized, center_top, center_bottom, (0, 255, 0), 2)

    # 입을 벌릴수록 ratio 값 작아짐
    # ratio 값으로 정확도 높임
    # 입 다물고있지 않으면 (말하고 있으면)

    if ver_line_lenght != 0:  # open mouth
        ratio = 1.5*(hor_line_lenght / ver_line_lenght)
    else:  # shut mouth
        ratio = 60

    return ratio
