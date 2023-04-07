import axios from "axios";

const BASE_URL = "https://mandarin.api.weniv.co.kr";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosImgUpload = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const getFollowersFeeds = async (feedParam = 1, token, options = {}) => {
  const res = await api.get(
    `/post/feed?limit=10&skip=${feedParam}`,
    {
      // headers를 api에 넣으면 기본적으로 모든 요청에 헤더가 붙는지 확인할 것
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    options
  );
  return res.data.posts;
};

export const getSearchUser = async (search, token) => {
  const res = await api.get(`/user/searchuser/?keyword=${search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};