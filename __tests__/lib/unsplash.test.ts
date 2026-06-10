import { describe, it, expect } from 'vitest';
import { getInstagramUrl, UnsplashPhoto } from '@/lib/unsplash';

describe('getInstagramUrl', () => {
  it('should return the Instagram URL when instagram_username is provided', () => {
    const photo = {
      id: '1',
      urls: {
        raw: '',
        full: '',
        regular: '',
        small: '',
        thumb: '',
      },
      alt_description: '',
      description: '',
      user: {
        name: 'John Doe',
        username: 'johndoe',
        social: {
          instagram_username: 'johndoe_photo',
        },
      },
      likes: 10,
    } as UnsplashPhoto;

    const url = getInstagramUrl(photo);
    expect(url).toBe('https://instagram.com/johndoe_photo');
  });

  it('should return an empty string when social object is missing', () => {
    const photo = {
      id: '2',
      urls: {
        raw: '',
        full: '',
        regular: '',
        small: '',
        thumb: '',
      },
      alt_description: '',
      description: '',
      user: {
        name: 'Jane Doe',
        username: 'janedoe',
      },
      likes: 5,
    } as UnsplashPhoto;

    const url = getInstagramUrl(photo);
    expect(url).toBe('');
  });

  it('should return an empty string when instagram_username is missing', () => {
    const photo = {
      id: '3',
      urls: {
        raw: '',
        full: '',
        regular: '',
        small: '',
        thumb: '',
      },
      alt_description: '',
      description: '',
      user: {
        name: 'Bob Smith',
        username: 'bobsmith',
        social: {},
      },
      likes: 20,
    } as UnsplashPhoto;

    const url = getInstagramUrl(photo);
    expect(url).toBe('');
  });
});
