import React, { Component } from "react";
import "./JoinPage.css";

class JoinPage extends Component {
  render() {
    return (
      <form action="/join" method="post">
        {/*로고*/}
        <div class="top_joinpage">
          <h1 id="logo_joinpage">WORD BALLOON</h1>
        </div>
        {/*회원가입 */}
        {/*아이디*/}
        <div class="ID">
          <input id="ID" type="text" name="id" placeholder="ID"></input>
          <button id="ID_check">중복확인</button>
        </div>
        {/*비번*/}
        <div>
          <input
            id="PW"
            type="password"
            name="pw"
            placeholder="PASSWORD"
          ></input>
        </div>
        <div>
          <input id="PW_check" type="text" placeholder="PASSWORD 확인"></input>
        </div>
        {/*이름,생년월일*/}
        <div class="personal">
          <input
            id="User_name"
            type="text"
            name="name"
            placeholder="사용자 이름"
          ></input>
          <input
            id="User_bityhday"
            type="text"
            name="birth"
            placeholder="생년월일(6자리)"
          ></input>
        </div>
        {/*완료버튼*/}
        <div>
          <button id="Join_btn" type="submit">
            회원가입 완료
          </button>
        </div>
      </form>
    );
  }
}
export default JoinPage;
