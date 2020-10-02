# mask.makemask()로 호출
# # frace_mask_small : resize된 마스크 이미지
# resized : 프레임
# x, y, w, h : 말풍선 위치할 좌표

import os
import cv2


def makemask(face_mask_small, resized, x, y, w, h):
    # frame 얼굴에 맞춰서 자르기
    frame_roi = resized[y: y + h, x: x + w]
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
    # 이미지처리 완료한 이미지를 프레임에 씌운다.
    resized[y: y + h, x: x + w] = cv2.add(masked_face, masked_frame)

    return resized


# mask.save_video()로 호출
# video_path : 비디오 경로
# cap : 비디오


def save_video(video_path, cap):
    # 영상 저장 준비
    s = os.path.splitext(os.path.basename(video_path))
    filename = './upload/novoice(' + str(s[0]) + ').mp4'
    fourcc = cv2.VideoWriter_fourcc(*'DIVX')
    fps_save = cap.get(cv2.CAP_PROP_FPS)
    out = cv2.VideoWriter(filename, fourcc, fps_save, (1000, 600))

    return out
