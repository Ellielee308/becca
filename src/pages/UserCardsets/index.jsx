import styled, { keyframes } from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getUserAllCardSets,
  getUserCardStyles,
  deleteCardSet,
} from "../../utils/api.js";
import { Modal, message } from "antd";

function UserCardSets() {
  const { user } = useUser();
  const [currentUserId, setCurrentUserId] = useState("");
  const [userCardSets, setUserCardSets] = useState(null);
  const [userCardStyles, setUserCardStyles] = useState(null);
  const [styleMap, setStyleMap] = useState(null);
  const [visibleMenuCardSetId, setVisibleMenuCardSetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.userId);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCardSets = async () => {
      if (currentUserId) {
        // 獲取卡牌組和樣式資料
        const cardSets = await getUserAllCardSets(currentUserId);
        const sortedCardSets = cardSets.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.toMillis
              ? a.createdAt.toMillis()
              : new Date(a.createdAt).getTime();
            const bTime = b.createdAt.toMillis
              ? b.createdAt.toMillis()
              : new Date(b.createdAt).getTime();
            return aTime - bTime;
          }
          return 0;
        });

        setUserCardSets(sortedCardSets);

        const cardStyles = await getUserCardStyles(currentUserId);
        setUserCardStyles(cardStyles);
        const newStyleMap = cardStyles.reduce((acc, style) => {
          acc[style.styleId] = style;
          return acc;
        }, {});
        setStyleMap(newStyleMap);
      }
    };

    fetchCardSets();
  }, [currentUserId]);

  const toggleMenu = (cardSetId) => {
    setVisibleMenuCardSetId((prev) => (prev === cardSetId ? null : cardSetId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果點擊發生在選單或按鈕內部，則不關閉
      if (
        event.target.closest(".more-actions-container") ||
        event.target.closest(".sub-menu")
      ) {
        return;
      }
      // 如果點擊發生在外部，關閉選單
      setVisibleMenuCardSetId(null);
    };

    // 監聽 mousedown 事件來捕捉點擊
    document.addEventListener("mousedown", handleClickOutside);

    // 清除監聽器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function copyShareUrl(cardSetId) {
    const copyText = `https://becca-24.web.app/cardset/${cardSetId}`;

    if (navigator.clipboard && window.isSecureContext) {
      // 使用 Clipboard API
      navigator.clipboard
        .writeText(copyText)
        .then(() => {
          message.success("已複製分享連結！");
        })
        .catch((error) => {
          console.error("無法複製分享連結：", error);
          message.error("複製失敗，請重試"); // 顯示錯誤信息
        });
    } else {
      console.error("無法複製分享連結：沒有clipboard API");
      message.error("瀏覽器不支援複製功能！");
    }
  }

  async function handleDeleteCardSet(cardSetId) {
    if (isDeleting) return;

    Modal.confirm({
      title: "刪除卡牌組後無法復原，確定刪除嗎？",
      okText: "確定",
      cancelText: "取消",
      icon: null,
      centered: true,
      okButtonProps: {
        style: {
          backgroundColor: "#3d5a80", // 自定義確定按鈕顏色
          color: "white",
          outline: "none", // 移除 outline
          border: "none", // 移除按鈕邊框
          boxShadow: "none", // 禁用按鈕陰影
        },
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#c9c5c5", // 自定義取消按鈕顏色
          color: "white",
          outline: "none", // 移除 outline
          border: "none", // 移除按鈕邊框
          boxShadow: "none", // 禁用按鈕陰影
        },
      },
      onOk: async () => {
        try {
          setIsDeleting(true);
          await deleteCardSet(cardSetId);
          message.success("已刪除卡牌。");
          setUserCardSets((prev) =>
            prev.filter((set) => set.cardSetId !== cardSetId)
          );
        } catch (error) {
          console.error("刪除卡牌組失敗：", error);
          message.error("刪除卡牌失敗，請稍後再試！");
        } finally {
          setIsDeleting(false); // 無論成功與否都重置刪除狀態
        }
      },
    });
  }
  if (!currentUserId || !userCardSets || !userCardStyles || !styleMap) {
    return (
      <Wrapper>
        <TitleBar>
          <FolderOpenIcon />
          <Title>所有卡牌組</Title>
        </TitleBar>
        <Split />
        <CardGridWrapper>
          <SkeletonCardContainer />
          <SkeletonCardContainer />
          <SkeletonCardContainer />
          <SkeletonCardContainer />
        </CardGridWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {contextHolder}
      <TitleBar>
        <FolderOpenIcon />
        <Title>所有卡牌組</Title>
      </TitleBar>
      <Split />
      <CardGridWrapper>
        {userCardSets &&
          userCardStyles &&
          styleMap &&
          userCardSets.length > 0 &&
          userCardSets.map((cardSet) => {
            return (
              <CardContainer key={cardSet.cardSetId}>
                <Link to={`/cardset/${cardSet.cardSetId}`}>
                  <CardWrapper $cardSetStyle={styleMap[cardSet.styleId]}>
                    {cardSet.title}
                  </CardWrapper>
                </Link>
                <CardSetDetailsContainer>
                  <CardSetActionWrapper>
                    <Link to={`/cardset/${cardSet.cardSetId}`}>
                      <CardSetTitle>{cardSet.title}</CardSetTitle>
                    </Link>
                    <EditIconContainer>
                      <Link to={`/cardset/${cardSet.cardSetId}/edit`}>
                        <EditIcon />
                      </Link>
                    </EditIconContainer>
                  </CardSetActionWrapper>
                  <CardSetDescription>{cardSet.description}</CardSetDescription>
                  <LabelWrapper>
                    <CardNumber>{cardSet.cardOrder.length} 張字卡</CardNumber>
                  </LabelWrapper>
                  <LabelWrapper>
                    {cardSet.visibility === "public" ? (
                      <>
                        <LabelIconContainer>
                          <PublicIcon />
                        </LabelIconContainer>
                        <PrivacyName>公開</PrivacyName>
                      </>
                    ) : (
                      <>
                        <LabelIconContainer>
                          <PrivateIcon />
                        </LabelIconContainer>
                        <PrivacyName>私人</PrivacyName>
                      </>
                    )}
                  </LabelWrapper>
                  <LabelWrapper>
                    <LabelIconContainer>
                      <LabelIcon />
                    </LabelIconContainer>
                    <LabelNameContainer>
                      {cardSet.labels.length > 0 ? (
                        cardSet.labels.map((label, index) => (
                          <Link
                            key={label.labelId}
                            to={`/search/${label.name}`}
                          >
                            <LabelName>
                              {label.name}
                              {index < cardSet.labels.length - 1 && ", "}
                            </LabelName>
                          </Link>
                        ))
                      ) : (
                        <NoLabelName>無標籤</NoLabelName>
                      )}
                    </LabelNameContainer>
                    <MoreActionsContainer
                      className="more-actions-container"
                      onClick={() => toggleMenu(cardSet.cardSetId)}
                    >
                      <MoreIcon />
                      {visibleMenuCardSetId === cardSet.cardSetId && (
                        <SubMenu className="sub-menu">
                          <SubMenuItem
                            onClick={() => copyShareUrl(cardSet.cardSetId)}
                          >
                            <ShareIcon />
                            <SubMenuItemText>分享</SubMenuItemText>
                          </SubMenuItem>
                          <SubMenuItem
                            onClick={() =>
                              handleDeleteCardSet(cardSet.cardSetId)
                            }
                          >
                            <TrashIcon />
                            <SubMenuItemText $isDelete>
                              {isDeleting ? "刪除中..." : "刪除"}
                            </SubMenuItemText>
                          </SubMenuItem>
                        </SubMenu>
                      )}
                    </MoreActionsContainer>
                  </LabelWrapper>
                </CardSetDetailsContainer>
              </CardContainer>
            );
          })}
      </CardGridWrapper>
      {userCardSets && userCardSets.length === 0 && (
        <div>
          目前沒有卡牌組，可以點擊
          <LinkToCardSetNew to="/cardset/new">此處</LinkToCardSetNew>
          建立卡牌組！
        </div>
      )}
    </Wrapper>
  );
}

export default UserCardSets;

const Wrapper = styled.div`
  padding: 80px 80px;
  min-height: 100vh;
  background-color: #fff;
  @media only screen and (min-width: 640px) and (max-width: 1023px) {
    margin-left: 60px;
  }
  @media only screen and (max-width: 639px) {
    margin-left: 0px;
    padding: 80px 32px;
  }
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3d5a80;
`;

const Title = styled.h2`
  font-size: 22px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #3d5a80;
`;

const Split = styled.div`
  margin-top: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

const CardGridWrapper = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const CardContainer = styled.div`
  width: 100%;
  padding: 20px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  background-color: #fff;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  max-height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.$cardSetStyle.borderRadius};
  border: ${(props) => props.$cardSetStyle.borderStyle};
  border-width: ${(props) => props.$cardSetStyle.$borderWidth};
  border-color: ${(props) => props.$cardSetStyle.borderColor};
  background-color: ${(props) => props.$cardSetStyle.backgroundColor};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media only screen and (max-width: 1024px) {
    max-height: 320px;
  }
`;
const CardSetDetailsContainer = styled.div`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
`;

const CardSetActionWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: row;
`;

const CardSetTitle = styled.p`
  font-size: 16px;
`;

const CardSetDescription = styled.p`
  margin-top: 8px;
  font-size: 14px;
  text-align: justify;
  height: 60px;
  overflow: hidden;
  white-space: pre-line;
  color: gray;
  line-height: 24px;
`;

const LabelWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
`;

const LabelNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const PrivacyName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const LabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
  cursor: pointer; // 指針變成手型
  transition: color 0.3s ease; // 增加過渡效果

  &:hover {
    color: #3d5a80; // 修改為更顯眼的顏色，與網站主題一致
  }
`;

const NoLabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const CardNumber = styled.div`
  padding: 6px 16px;
  font-family: "Noto Sans TC", sans-serif;
  background-color: #d0d7e3;
  color: #3d5a80;
  border-radius: 100vw;
  font-size: 14px;
  transition: background-color 0.5s ease;
  user-select: none;
`;

const EditIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
`;

const MoreActionsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: auto;
`;

const SubMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  min-width: 120px;
  z-index: 100;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
`;

const SubMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const SubMenuItemText = styled.p`
  margin-left: 14px;
  color: ${(props) => (props.$isDelete ? "red" : "inherit")};
`;

const LinkToCardSetNew = styled(Link)`
  margin: 0 4px;
  color: #3d5a80;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;
/* Skeleton */
const skeletonLoading = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonCardContainer = styled.div`
  width: 100%;
  aspect-ratio: 23/24;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonLoading} 1.5s infinite;
`;

const LabelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const PublicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path
      fillRule="evenodd"
      d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const PrivateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
    />
  </svg>
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="22"
    height="22"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

export const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="red"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

const FolderOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
    />
  </svg>
);
