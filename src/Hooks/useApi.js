import { useMutation, useQuery } from "@tanstack/react-query";
import ApiClient, { axiosInstance } from "../helpers/api_helper";

export const useGet = (url, options = {}) =>
  useQuery({
    queryKey: [url],
    queryFn: () => ApiClient.get(url),
    refetchOnWindowFocus: false,
    retry: false,
    cacheTime: 0,
    staleTime: 0,
    ...options,
  });

export const useDelete = (url, options = {}) =>
  useQuery({
    queryKey: [url],
    queryFn: () => ApiClient.delete(url),
    refetchOnWindowFocus: false,
    ...options,
  });

//With access-token in Header
export const usePost = (url, options = {}) =>
  useMutation({
    mutationKey: [`post-${url}`],
    mutationFn: (data) => ApiClient.post(url, data),
    refetchOnWindowFocus: false,
    ...options,
  });

//Without access-token in Header
export const useRawPost = (url, options = {}) =>
  useMutation({
    mutationKey: [`post-${url}`],
    mutationFn: (data) => axiosInstance.post(url, data),
    refetchOnWindowFocus: false,
    ...options,
  });

//Without access-token in Header And Form Data

export const useRawGet = (url, options = {}) =>
  useQuery({
    queryKey: [url],
    queryFn: () => axiosInstance.get(url),
    refetchOnWindowFocus: false,
    ...options,
  });

export const usePatch = (url, options = {}) =>
  useMutation({
    mutationKey: [`patch-${url}`],
    mutationFn: (data) => ApiClient.patch(url, data),
    refetchOnWindowFocus: false,
    ...options,
  });

export const usePut = (url, options = {}) =>
  useMutation({
    mutationKey: [`put-${url}`],
    mutationFn: (data) => ApiClient.put(url, data),
    refetchOnWindowFocus: false,
    ...options,
  });