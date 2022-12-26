import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeaderSave } from "../../shared/Header/HeaderSave";
import Textarea from "../../components/Textarea/Textarea";
import axios, { axiosImgUpload } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const PostUpload = () => {
  const myProfile = `${process.env.PUBLIC_URL}/assets/img/profile-man-small.png`;
  const imgUpload = `${process.env.PUBLIC_URL}/assets/img/icon-upload-file.png`;
  const imgCancle = `${process.env.PUBLIC_URL}/assets/img/icon-x.png`;

  const textareaRef = useRef();
  const [isText, setIsText] = useState(false);

  const [images, setImages] = useState([]);
  const [imageURLs, setimageURLs] = useState([]);

  const [uploadPossible, setUploadPossible] = useState(true);

  const navigate = useNavigate();

  // 이미지 업로드
  const handleImgUpload = (e) => {
    const countImage = e.target.files.length;
    const maxSize = 10 * 1024 * 1024;
    let totalSize = 0;

    if (countImage > 3) {
      alert("이미지는 최대 3장까지 가능합니다.");
      return;
    }

    for (let i = 0; i < countImage; i++) {
      totalSize += e.target.files[i].size;
    }

    if (totalSize > maxSize) {
      alert("이미지 용량은 10MB를 초과할 수 없습니다.");
      return;
    }
    setImages([...e.target.files]);
  };

  useEffect(() => {
    const newImageURLs = [];
    images.map((image) => newImageURLs.push(URL.createObjectURL(image)));
    setimageURLs(newImageURLs);
  }, [images]);

  const handleImgCancle = (e) => {
    const newImages = images.filter((_, index) => index !== parseInt(e.target.id));
    setImages(newImages);
  };

  // 포스트 업로드에서 호출 - 전송할 이미지 서버에 요청 후 응답 받기
  const ImageFormData = async (files) => {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("image", files[i]);
      }
      const res = await axiosImgUpload.post("/image/uploadfiles", formData);
      if (res.status !== 200) {
        throw new Error(res.status, "통신에 실패했습니다.");
      }
      const imageName = res.data.map((image) => image["filename"]).join(", ");
      return imageName;
    } catch (err) {
      console.error(err);
    }
  };

  // 포스트 업로드
  const onSubmitForm = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        setUploadPossible(false);

        const token = localStorage.getItem("token");
        const imageName = await ImageFormData(images);

        const res = await axios.post(
          "/post",
          {
            post: {
              content: textareaRef.current.value,
              image: imageName,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status !== 200) {
          setUploadPossible(true);
          throw new Error(res.status, "통신에 실패했습니다.");
        }
        navigate(`/profile/${res.data.post.author["accountname"]}`);
      } catch (err) {
        console.log(err);
      }
    },
    [images, navigate]
  );

  return (
    <div className="page">
      {/* Note: Header 수정 필요 */}
      <HeaderSave btnText="업로드" isActive={uploadPossible && (isText || imageURLs.length)} {...{ onSubmitForm }} />
      <main className="pt-[2rem] px-[1.6rem]">
        {/* 프로필 및 텍스트 */}
        <img src={myProfile} alt="" className="inline-block align-top w-[4.2rem] h-[4.2rem] object-cover" />
        <form className="inline-block">
          <Textarea ref={textareaRef} {...{ setIsText }} />
        </form>

        {/* 업로드 이미지 확인 및 삭제 */}
        {!!imageURLs.length &&
          (imageURLs.length === 1 ? (
            <>
              {imageURLs.map((imgURL, index) => (
                <div key={crypto.randomUUID()} className="relative">
                  <img src={imgURL} alt="" className="w-[30.4rem] h-[22.8rem] ml-auto object-cover rounded-[10px]" />
                  <button type="button" onClick={handleImgCancle}>
                    <img
                      src={imgCancle}
                      id={index}
                      alt=""
                      className="w-[2rem] h-[2rem] absolute top-[1.1rem] right-[1.1rem]"
                    />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div className="flex overflow-hidden overflow-x-auto w-[30.4rem] ml-[5.4rem]">
              {imageURLs.map((imgURL, index) => (
                <div key={index} className="relative first:ml-0 ml-[0.8rem] shrink-0">
                  <img
                    // key={index}
                    src={imgURL}
                    alt=""
                    className="w-[16.8rem] h-[12.6rem] object-cover rounded-[10px]"
                  />
                  <button type="button" onClick={handleImgCancle}>
                    <img
                      src={imgCancle}
                      id={index}
                      alt=""
                      className="w-[1.5rem] h-[1.5rem] absolute top-[1.1rem] right-[1.1rem]"
                    />
                  </button>
                </div>
              ))}
            </div>
          ))}
      </main>
      <form className="p-[1.6rem] ">
        <fieldset>
          <legend className="ir">사진 업로드</legend>
          <label htmlFor="imgUpload" className="block ml-auto w-[5rem] h-[5rem]">
            <img src={imgUpload} alt="" className="w-[5rem] h-[5rem] ml-auto cursor-pointer" />
          </label>
          <input id="imgUpload" multiple accept="image/*" type="file" className="hidden" onChange={handleImgUpload} />
        </fieldset>
      </form>
    </div>
  );
};

export default PostUpload;