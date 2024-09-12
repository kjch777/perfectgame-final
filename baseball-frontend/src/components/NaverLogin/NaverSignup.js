import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import LoginContext from "../Login/LoginContext";
import '../../css/NaverSignup.css';

function NaverSignup() {
  const [userInfo, setUserInfo] = useState(null);
  const [newId, setNewId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [errors, setErrors] = useState({});
  const [validations, setValidations] = useState({});
  const [isDuplicate, setIsDuplicate] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { loginMember } = useContext(LoginContext);

  useEffect(() => {
    const a = new URLSearchParams(location.search);
    const accessToken = a.get("access_token");
    console.log("토큰 확인 : " + accessToken);
    if (accessToken) {
      axios.get(`/api/signup/naver?access_token=${accessToken}`)
        .then(response => {
          setUserInfo(response.data);
          setLoading(false);
        })
        .catch((err) => {
          alert("정보를 가져오지 못했습니다.");
        });
    }
  }, [location.search]);

  if (loading) {
    return <div>데이터 정보 가져오는 중...</div>
  }

  // Validation Functions
  const validateId = (id) => {
    const idRegex = /^[a-z0-9]{4,12}$/;
    return idRegex.test(id) ? "" : "아이디는 4-12자의 소문자와 숫자만 사용할 수 있습니다.";
  };

  const validatePw = (pw) => {
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^*+=-])[a-zA-Z\d!@#$%^*+=-]{4,18}$/;
    return pwRegex.test(pw) ? "" : "비밀번호는 4-18자의 영문 대/소문자, 숫자 및 특수문자(!@#$%^*+=-)를 포함해야 합니다.";
  };

  const validatePasswordConfirm = (pw, pwConfirm) => {
    return pw === pwConfirm ? "" : "비밀번호가 일치하지 않습니다.";
  };

  // Handle Input Change
  const handleInputChange = (setter, validator) => (e) => {
    const value = e.target.value;
    setter(value);
    setErrors(prevErrors => ({
      ...prevErrors,
      [e.target.name]: validator(value),
    }));
    setValidations(prevValidations => ({
      ...prevValidations,
      [e.target.name]: validator(value),
    }));
  };

  const handlePasswordConfirmChange = (e) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    setErrors(prevErrors => ({
      ...prevErrors,
      passwordConfirm: validatePasswordConfirm(password, value),
    }));
    setValidations(prevValidations => ({
      ...prevValidations,
      passwordConfirm: validatePasswordConfirm(password, value),
    }));
  };

  const checkDuplicateId = async () => { 
    if (!newId.trim()) {
      alert("아이디를 입력하세요");
      setIsDuplicate(true);
      return;
    }
    try {
      const response = await axios.get('/members/idCheck', {
        params: { id: newId },
      });
      setIsDuplicate(response.data > 0);
    } catch (error) {
      console.error('ID 체크 중 문제 발생:', error);
      setIsDuplicate(false);
    }
  };

  const handleNaverSignup = (event) => {
    event.preventDefault();

    if (loginMember) {
      alert('이미 로그인된 상태입니다');
      navigate('/');
      return;
    }

    const formErrors = {
      newId: validateId(newId),
      password: validatePw(password),
      passwordConfirm: validatePasswordConfirm(password, passwordConfirm),
    };

    setErrors(formErrors);

    if (Object.values(formErrors).every(error => error === "") && isDuplicate === false) {
      axios.post('/NaverAPI/register', {
        id: userInfo.response.id,
        email: userInfo.response.email,
        nickname: userInfo.response.nickname,
        name: userInfo.response.name,
        gender: userInfo.response.gender,
        image: userInfo.response.profile_image,
        mobile: userInfo.response.mobile,
        newId: newId,
        password: password
      })
        .then(response => {
          console.log(response.data);
          alert("회원가입이 완료되었습니다.");
          navigate('/login');
        })
        .catch(err => {
          console.error('개발자가 에러 확인하는 공간 : ', err);
          alert("회원가입에 실패하였습니다.");
        });
    } else if (isDuplicate === '') {
      alert("아이디중복확인을 진행해주세요.");
    } else {
      alert("유효성 검사를 통과하지 못했습니다.");
    }
  }

  return (
    <div className="naver-api-outer-container">
      <div className="naver-api-container">
        <h2>네이버 유저정보</h2>
        {userInfo ? (
          <div>
            <div className="naver-api-item">
              <label>아이디</label>
              <input type="text" value={userInfo.response.id} disabled />
            </div>
            <div className="naver-api-item">
              <label>이메일</label>
              <input type="email" value={userInfo.response.email} disabled />
            </div>
            <div className="naver-api-item">
              <label>이름</label>
              <input type="text" value={userInfo.response.name} disabled />
            </div>
            <div className="naver-api-item">
              <label>핸드폰 번호</label>
              <input type="text" value={userInfo.response.mobile} disabled />
            </div>
            <div className="naver-api-item">
              <label>프로필 이미지</label>
              <img src={userInfo.response.profile_image} className="naver-api-image" alt="Profile" />
            </div>
          </div>
        ) : (
          <p>유저를 찾을 수 없습니다.</p>
        )}
      </div>
      
      <div className="naver-signup-form">
        <h1>Perfect Game 회원가입</h1>
        <form onSubmit={handleNaverSignup}>
          <div className="naver-signup-item">
            <label>아이디</label>
            <button type="button"
                    className="duplicate-id-button"
                    onClick={checkDuplicateId}>아이디 중복 확인</button>
            <br/>
            <input type="text"
                   name="newId"
                   value={newId}
                   onChange={handleInputChange(setNewId, validateId)}
                   placeholder="아이디를 입력하세요" />
            {errors.newId && <span className="error">{errors.newId}</span>}
            {validations.newId && !errors.newId && <span className="valid">{validations.newId}</span>}
            {isDuplicate === true && <span className="error">사용 불가능한 아이디입니다.</span>}
            {isDuplicate === false && !errors.newId && <span className="valid">사용 가능한 아이디입니다.</span>}
          </div>
          <div className="naver-signup-item">
            <label>비밀번호</label>
            <input type="password"
                   name="password"
                   value={password}
                   onChange={handleInputChange(setPassword, validatePw)}
                   placeholder="비밀번호를 입력하세요" />
            {errors.password && <span className="error">{errors.password}</span>}
            {validations.password && !errors.password && <span className="valid">{validations.password}</span>}
          </div>
          <div className="naver-signup-item">
            <label>비밀번호 확인</label>
            <input type="password"
                   name="passwordConfirm"
                   value={passwordConfirm}
                   onChange={handlePasswordConfirmChange}
                   placeholder="비밀번호 확인" />
            {errors.passwordConfirm && <span className="error">{errors.passwordConfirm}</span>}
            {validations.passwordConfirm && !errors.passwordConfirm && <span className="valid">{validations.passwordConfirm}</span>}
          </div>
          <div className="naver-signup-button-container">
            <button type="submit"
                    className="naver-signup-button">회원가입하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NaverSignup;
