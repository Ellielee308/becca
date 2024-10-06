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

function UserProfile() {
  const { user, setUser, loading } = useUser();
  const [cardSetCount, setCardSetCount] = useState(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(null);
  const [activeDays, setActiveDays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制 Modal 的狀態
  const [newProfilePicture, setNewProfilePicture] = useState(null);

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

        alert("大頭貼更新成功！");
        handleCloseModal(); // 關閉 modal
      } catch (error) {
        console.error("更新大頭貼失敗", error);
        alert("更新大頭貼失敗，請稍後再試！");
      }
    }
  };

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
  padding: 0 100px 0 120px;
  width: fit-content;
  margin: 80px auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media only screen and (max-width: 639px) {
    padding: 0 0 20px 0;
    width: 100%;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
`;

const Split = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

const ProfileSection = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
  margin-bottom: 36px;
  @media only screen and (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
    align-items: center;
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
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 60px;
  justify-content: space-around;
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
  width: 100%;
  justify-content: center;
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
  min-height: 200px;
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
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #c9c5c5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
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
