import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { useEffect, useState } from "react";
import {
  getUserCardSetCount,
  getCompletedQuizzesCount,
  updateProfilePicture,
} from "../../utils/api.js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { message } from "antd";
import Collection from "./Collection.jsx";

function UserProfile() {
  const { user, setUser, loading } = useUser();
  const [cardSetCount, setCardSetCount] = useState(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(null);
  const [activeDays, setActiveDays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制 Modal 的狀態
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewProfilePicture(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleCancel = () => {
    handleCloseModal(); // 取消時清空圖片並關閉 modal
  };
  const handleSaveProfilePicture = async () => {
    if (newProfilePicture) {
      try {
        // 上傳新頭貼並獲取下載 URL
        const updatedProfilePictureURL = await updateProfilePicture(
          user.userId,
          newProfilePicture
        );

        // 更新本地的 user 狀態，使頭像立即顯示新的圖片
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: updatedProfilePictureURL, // 更新狀態中的頭像 URL
        }));

        message.success("大頭貼更新成功！");
        handleCloseModal();
      } catch (error) {
        console.error("更新大頭貼失敗", error);
        message.error("更新大頭貼失敗，請稍後再試！");
      }
    }
  };

  if (!user || loading || cardSetCount === null || completedQuizCount === null)
    return (
      <>
        <div>Loading...</div>
      </>
    );
  return (
    <Wrapper>
      {contextHolder}
      <InfoSection>
        <ProfileSection>
          <TitleBar>
            <ProfileIcon />
            <Title>用戶總覽</Title>
          </TitleBar>
          <Split />
          <ProfileInfoWrapper>
            <ProfilePictureContainer>
              <ProfilePicture
                src={
                  newProfilePicture
                    ? URL.createObjectURL(newProfilePicture)
                    : user.profilePicture
                }
              />
              <EditProfilePictureIcon onClick={handleIconClick}>
                <EditIcon />
              </EditProfilePictureIcon>
            </ProfilePictureContainer>
            <AccountInfo>
              <AccountInfoItem>{`Email: ${user.email}`}</AccountInfoItem>
              <AccountInfoItem>{`用戶名: ${user.username}`}</AccountInfoItem>
              <AccountInfoItem>{`卡牌組數量: ${
                cardSetCount ? cardSetCount : 0
              }`}</AccountInfoItem>
              <AccountInfoItem>
                {`完成測驗數量: ${completedQuizCount ? completedQuizCount : 0}`}
              </AccountInfoItem>
            </AccountInfo>
          </ProfileInfoWrapper>
        </ProfileSection>
        {/* Modal 彈窗 */}
        {isModalOpen && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>更換頭像</ModalHeader>
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {newProfilePicture && (
                <ImagePreview
                  src={URL.createObjectURL(newProfilePicture)}
                  alt="New profile preview"
                />
              )}
              <ModalActions>
                <UploadButton onClick={handleSaveProfilePicture}>
                  上傳
                </UploadButton>
                <CancelButton onClick={handleCancel}>取消</CancelButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
        <CalendarSection>
          <TitleBar>
            <CalendarIcon />
            <Title>活躍足跡</Title>
          </TitleBar>
          <Split />
          {activeDays.length > 0 && <UserCalendar activeDays={activeDays} />}
        </CalendarSection>
      </InfoSection>
      <CollectionSection>
        <TitleBar>
          <StarIcon />
          <Title>收藏的卡牌組</Title>
        </TitleBar>
        <Split />
        <Collection />
      </CollectionSection>
    </Wrapper>
  );
}

export default UserProfile;

const Wrapper = styled.div`
  padding: 80px 80px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #fff;
  @media only screen and (max-width: 1023px) {
    padding: 80px 100px;
  }
  @media only screen and (max-width: 969px) {
    margin-left: 40px;
  }
  @media only screen and (max-width: 639px) {
    margin-left: 0px;
    padding: 80px 32px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
  @media only screen and (max-width: 969px) {
    flex-direction: column;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #3d5a80;
`;

const Split = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-top: 1.5px solid #c9c9c9;
  width: 100%;
`;

const ProfileSection = styled.div`
  display: flex;
  justify-content: center;
  width: 50%;
  margin-bottom: 36px;
  flex-direction: column;
  height: 100%;
  @media only screen and (max-width: 969px) {
    width: 100%;
  }
  @media only screen and (max-width: 480px) {
    gap: 20px;
    align-items: center;
  }
`;

const ProfileInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10%;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
`;

const ProfilePictureContainer = styled.div`
  height: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;
const ProfilePicture = styled.img`
  height: 160px;
  width: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3; // 添加灰色框線
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 40px;
  justify-content: space-around;
  @media only screen and (max-width: 1023px) {
    padding-left: 0px;
  }
  @media only screen and (max-width: 480px) {
    gap: 14px;
    padding-left: 0;
    align-items: center;
  }
`;

const AccountInfoItem = styled.p`
  font-size: 16px;
`;

const CalendarSection = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 50%;
  @media only screen and (max-width: 969px) {
    width: 100%;
  }
`;

const EditProfilePictureIcon = styled.div`
  position: absolute; /* 確保它相對於父元素（頭像容器）進行定位 */
  bottom: 5%; /* 將圖標移動到容器的底部 */
  right: 5%; /* 將圖標移動到容器的右側 */
  background-color: white; /* 讓圖標背景顯示白色，讓其不被頭像的背景顏色覆蓋 */
  padding: 6px;
  border-radius: 50%;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15); /* 添加陰影讓按鈕更明顯 */
  cursor: pointer;
`;
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
  </svg>
);

/* Modal 相關樣式 */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 130;
`;

const ModalContent = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
  min-width: 300px;
  max-width: 400px;
  min-height: 240px;
`;

const ModalHeader = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
`;

const FileInput = styled.input`
  margin-bottom: 20px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  border-radius: 8px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`;

const UploadButton = styled.button`
  padding: 10px 20px;
  background-color: #f59873;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #c9c5c5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
`;

const UserCalendar = ({ activeDays }) => {
  const [value, setValue] = useState(new Date());
  const [activeView, setActiveView] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);

  // 處理 activeDays 數據並轉換成 Date 格式
  useEffect(() => {
    if (activeDays) {
      const days = activeDays.map((day) => new Date(day.seconds * 1000)); // 將 Firebase Timestamp 轉換為 Date
      setHighlightedDates(days);
    }
  }, [activeDays]);

  // 處理月份切換
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      setActiveView(activeStartDate);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      // 檢查是否為未來日期
      const isInFuture = date > new Date();

      const isActive = highlightedDates.some(
        (activeDay) =>
          activeDay.getDate() === date.getDate() &&
          activeDay.getMonth() === date.getMonth() &&
          activeDay.getFullYear() === date.getFullYear()
      );

      const belongsToDisplayedMonth =
        date.getMonth() === activeView.getMonth() &&
        date.getFullYear() === activeView.getFullYear();

      if (belongsToDisplayedMonth) {
        // 如果是未來日期，不添加任何背景色
        if (isInFuture) {
          return "future-date";
        }
        return isActive ? "highlight" : "inactive";
      }

      return "other-month";
    }
    return null;
  };

  return (
    <CalendarWrapper>
      <Calendar
        value={value}
        tileClassName={tileClassName}
        view="month"
        maxDetail="month"
        showNavigation={true}
        onActiveStartDateChange={handleActiveStartDateChange}
        activeStartDate={activeView}
      />
      <ExplanationWrapper>
        <ExplanationBar>
          <ExampleActiveCircle />
          <ExampleText>上線日期</ExampleText>
        </ExplanationBar>
        <ExplanationBar>
          <ExampleTodayCircle />
          <ExampleText>今日日期</ExampleText>
        </ExplanationBar>
      </ExplanationWrapper>
    </CalendarWrapper>
  );
};

const CalendarWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: row;
  @media only screen and (max-width: 1279px) {
    flex-direction: column;
  }
  @media only screen and (max-width: 969px) {
    flex-direction: row;
    margin-bottom: 16px;
  }
  @media only screen and (max-width: 750px) {
    flex-direction: column;
  }
  .react-calendar {
    font-family: "Noto Sans TC", sans-serif;
    width: 360px;
    height: 360px;
    background-color: #f9f9f9;
    border-radius: 12px;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
    padding: 20px;
    border: none;
    display: flex;
    flex-direction: column;
    @media only screen and (max-width: 480px) {
      width: 100%;
      height: 360px;
    }
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

  .react-calendar__navigation__label {
    font-weight: bold;
    font-size: 18px;
    color: #3d5a80;
    cursor: default !important;
    pointer-events: none; /* 添加這行來禁用所有點擊事件 */
    user-select: none; /* 防止文字被選中 */
  }

  /* 確保標題按鈕也完全禁用 */
  .react-calendar__navigation__label > button {
    cursor: default !important;
    pointer-events: none;
  }

  /* 禁用月份視圖的點擊 */
  .react-calendar__year-view__months__month {
    pointer-events: none !important;
    cursor: default !important;
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
    /* border-radius: 50%; */
    border: 1px solid transparent;
    pointer-events: none;
    font-family: "Noto Sans TC", sans-serif;
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
  /* 活躍日期 */
  .highlight {
    background-color: #00b4d8;
    color: white !important;
    border-radius: 50%;
  }

  .highlight:hover {
    background-color: #00b4d8;
  }

  .inactive {
    background-color: #e0e0e0 !important;
    color: black !important;
    border-radius: 50%;
  }

  .react-calendar__tile--disabled {
    color: #ccc;
  }

  .react-calendar__navigation {
    cursor: default;
    color: #3d5a80;
    font-family: "Noto Sans TC", sans-serif;
  }

  /* 改進月份切換按鈕的樣式 */
  .react-calendar__navigation button {
    background-color: none;
    padding: 10px;
    border: none;
    cursor: pointer;
    font-family: "Noto Sans TC", sans-serif;
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
    cursor: not-allowed;
  }

  /* 週數和日期保持一致 */
  .react-calendar__month-view__weekdays {
    display: none !important;
  }

  .react-calendar__month-view__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 保持 7 列的日期結構 */
  }
  .react-calendar__navigation__next2-button {
    display: none;
  }

  .react-calendar__navigation__prev2-button {
    display: none;
  }

  .react-calendar__navigation__label {
  }
  .highlight {
    background-color: #00b4d8;
    color: white !important;
    /* border-radius: 50%; */
  }

  .highlight:hover {
    background-color: #00b4d8;
  }

  .inactive {
    background-color: #e0e0e0 !important;
    color: black !important;
    /* border-radius: 50%; */
  }

  /* 非當前月份的日期樣式 */
  .other-month {
    color: #ccc !important;
    background: none !important;
  }

  .future-date {
    background: none !important;
    color: black !important;
  }

  .react-calendar__tile--now {
    background: none !important; /* 移除背景色 */
    color: #000 !important; /* 設置日期文字顏色 */
    position: relative; /* 讓偽元素相對於父元素定位 */
  }

  .react-calendar__tile--now::after {
    content: "";
    position: absolute;
    bottom: 3px; /* 控制點的位置，讓它靠近數字的下方 */
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: #ff8a5b;
    border-radius: 50%;
    z-index: 1; /* 確保偽元素在日期數字的後面 */
  }

  .react-calendar__navigation__label__labelText,
  .react-calendar__navigation__label__labelText--from {
    color: #3d5a80;
  }
`;

const CollectionSection = styled.div`
  height: 600px;
  width: 100%;
`;

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="28"
    height="28"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3d5a80;
`;

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="28"
    height="28"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="28"
    height="28"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const ExplanationWrapper = styled.div`
  width: fit-content;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 10px;
  align-self: flex-end;
`;

const ExplanationBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ExampleActiveCircle = styled.div`
  background-color: #00b4d8;
  border-radius: 50%;
  width: 10px;
  height: 10px;
`;

const ExampleTodayCircle = styled.div`
  background-color: #ff8a5b;
  border-radius: 50%;
  width: 10px;
  height: 10px;
`;

const ExampleText = styled.div`
  font-size: 14px;
`;
