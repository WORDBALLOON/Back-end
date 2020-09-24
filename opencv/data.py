# 파일 이름을 filename 변수로 전달
# -*- coding:utf-8 -*-


def makefile(filename):

    import pandas as pd
    # 데이터 불러오기
    data = pd.read_csv(filename)

    # tst는 한 문장당 단어 길이
    tst = []
    spt = []
    for i in data['getPhraseText']:
        lists = len(i)
        tst.append(lists)
        # 문자가 32자 이상이면 중간에 "\n" 넣기
        if lists > 32:
            target_text = i
            target_text = target_text.split(" ")
            # print(target_text)
            result = []
            token = int(len(target_text)/4)
            print(token)
            for i in range(0, token):
                target_text.insert(5*(i+1), '\n')
            target_text = ' '.join(target_text)
            getToken = target_text
            spt.append(getToken)
        else:
            spt.append(i)
        lists = []
    tst
    spt
    data['textlength'] = tst
    data['textSplit'] = spt

    # st는 start_time 시작시간
    st = []
    for i in data['start_time']:
        # 시간 형식이 00:00:00이니까, :으로 문자열 나눈다.
        lists = i.split(":")
        # 나눈 문자열 중, 마지막 초를 뜻하는 원소인 2번째 원소를 st에 저장한다.
        st.append(lists[2])
        # 다음 원소 저장을 위한 초기화
        lists = []
    st
    data['start'] = st

    # et는 start_time 시작시간
    et = []
    for i in data['end_time']:
        listings = i.split(":")
        et.append(listings[2])
        listings = []

    et
    data['end'] = et

    # a는 데이터프레임의 열 개수
    a = int(data.shape[0])

    # rt는 시작 시간에서 끝시간을 뺀다.
    rt = []
    for i in range(0, a):
        rt.append(float(et[i])-float(st[i]))

    # 구한 한문장이 재생되는 시간(rt)와 문장 길이(length)를 데이터 프레임에 열을 추가하고, 그 data를 return값으로 준다.
    data['time'] = rt
    data['length'] = tst
    return data

# 밑의 코드대로 실행하면 데이터프레임을 얻을 수 있다. 이 데이터프레임을 사용하기 위해서는 data라는 변수에 넣어서 그 변수를 이용하면 된다.
# data=makefile("video_us2.csv")
# 만약, 데이터프레임의 길이변수들 중 5번째 원소(0부터 시작)를 얻고 싶다면,data['length][5]를 입력하면 그 수가 나오게 된다.
