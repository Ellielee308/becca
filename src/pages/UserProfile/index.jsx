import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { useEffect, useState } from "react";
import {
  getUserCardSetCount,
  getCompletedQuizzesCount,
} from "../../utils/api.js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function UserProfile() {
  const { user, setUser, loading } = useUser();
  const [cardSetCount, setCardSetCount] = useState(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(null);
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        const cardSetCountPromise = getUserCardSetCount(user.userId);
        const quizCountPromise = getCompletedQuizzesCount(user.userId);

        const [cardSetCount, quizCount] = await Promise.all([
          cardSetCountPromise,
          quizCountPromise,
        ]);

        setCardSetCount(cardSetCount);
        setCompletedQuizCount(quizCount);
        setActiveDays(user.activeDays);
      };

      fetchCounts();
    }
  }, [user]);

  if (!user || loading)
    return (
      <>
        <div>Loading...</div>
      </>
    );
  return (
    <Wrapper>
      <Title>用戶總覽</Title>
      <Split />
      <ProfileSection>
        <ProfilePictureContainer>
          <ProfilePicture src={user.profilePicture} />
        </ProfilePictureContainer>
        <AccountInfo>
          <AccountInfoItem>{`Email: ${user.email}`}</AccountInfoItem>
          <AccountInfoItem>{`用戶名: ${user.username}`}</AccountInfoItem>
          <AccountInfoItem>
            {cardSetCount && `卡牌組數量: ${cardSetCount}`}
          </AccountInfoItem>
          <AccountInfoItem>
            {completedQuizCount && `完成測驗數: ${completedQuizCount}`}
          </AccountInfoItem>
        </AccountInfo>
      </ProfileSection>
      <Title>活躍足跡</Title>
      <Split />
      <CalendarSection>
        {activeDays.length > 0 && <UserCalendar activeDays={activeDays} />}
      </CalendarSection>
    </Wrapper>
  );
}

export default UserProfile;

const Wrapper = styled.div`
  margin-top: 80px;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 28px;
`;

const Split = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

const ProfileSection = styled.div`
  display: flex;
  width: 100%;
  padding: 8px 0;
  margin-bottom: 36px;
`;

const ProfilePictureContainer = styled.div`
  height: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePicture = styled.img`
  height: 160px;
  width: 160px;
  border-radius: 50%;
  object-fit: cover;
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 8%;
  justify-content: space-around;
`;

const AccountInfoItem = styled.p`
  font-size: 16px;
`;

const CalendarSection = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;

const UserCalendar = ({ activeDays }) => {
  const [value, setValue] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);

  // 處理 activeDays 數據並轉換成 Date 格式
  useEffect(() => {
    if (activeDays) {
      const days = activeDays.map((day) => new Date(day.seconds * 1000)); // 將 Firebase Timestamp 轉換為 Date
      setHighlightedDates(days);
    }
  }, [activeDays]);

  // 自定義樣式渲染函數
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      // 檢查這一天是否在 activeDays 裡
      const isActive = highlightedDates.some(
        (activeDay) =>
          activeDay.getDate() === date.getDate() &&
          activeDay.getMonth() === date.getMonth() &&
          activeDay.getFullYear() === date.getFullYear()
      );
      return isActive ? "highlight" : "inactive";
    }
    return null;
  };

  return (
    <CalendarWrapper>
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName}
      />
    </CalendarWrapper>
  );
};

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    width: 400px;
    height: 400px;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    border: none;
    font-family: monospace;
    display: flex;
    flex-direction: column;
  }

  .react-calendar__viewContainer,
  .react-calendar__month-view {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .react-calendar__navigation button {
    color: #6f8695;
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
    font-weight: bold;
  }

  .react-calendar__month-view__days {
    flex-grow: 1;
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 2px;
  }

  .react-calendar__tile {
    max-width: 100% !important;
    aspect-ratio: 1; /* 保持 1:1 比例，確保日期格子為正方形 */
    background: none;
    text-align: center;
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    padding: 0;
    font-size: 14px; /* 日期字體大小 */
    border-radius: 50%; /* 讓日期成為圓形 */
    transition: background-color 0.3s ease;
    border: 1px solid transparent;
  }

  /* 禁用 hover 和選中效果 */
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    cursor: default;
  }
  .react-calendar__navigation button:hover,
  .react-calendar__navigation button:focus,
  .react-calendar__navigation button:active {
    background-color: transparent;
    outline: none;
  }

  .react-calendar__tile--now {
    background: #ebbd78 !important; /* 當前日期背景色 */
    color: #000;
  }

  /* 選中日期的樣式 */
  .react-calendar__tile--active {
    background: inherit;
    color: inherit;
    border-radius: 50%;
  }

  /* 活躍日期 */
  .highlight {
    background-color: #75e766;
    color: white !important;
    border-radius: 50%;
  }

  .highlight:hover {
    background-color: #75e766;
  }

  .inactive {
    background-color: #e0e0e0 !important;
    color: black !important;
    border-radius: 50%;
  }

  .react-calendar__tile--disabled {
    color: #ccc;
  }

  /* 改進月份切換按鈕的樣式 */
  .react-calendar__navigation button {
    background-color: none;
    padding: 10px;
    border: none;
    cursor: pointer;
    font-family: monospace;
  }
  .react-calendar__navigation button:hover,
  .react-calendar__navigation button:focus,
  .react-calendar__navigation button:active {
    background-color: transparent;
    outline: none;
  }

  .react-calendar__navigation button {
    background: transparent;
  }
  /* 月份標題樣式 */
  .react-calendar__navigation__label {
    font-weight: bold;
    font-size: 18px;
    color: #6f8695;
  }

  /* 週數和日期保持一致 */
  .react-calendar__month-view__weekdays {
    display: none !important;
  }

  .react-calendar__month-view__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 保持 7 列的日期結構 */
  }
`;
