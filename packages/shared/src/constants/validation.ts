import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하여야 합니다'),
});

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하여야 합니다'),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이하여야 합니다')
    .optional(),
  bio: z.string().max(200, '소개는 200자 이하여야 합니다').nullable().optional(),
  social_links: z
    .array(
      z.object({
        type: z.string(),
        url: z.string().url('유효한 URL을 입력해주세요'),
      }),
    )
    .nullable()
    .optional(),
  theme_preset: z.string().optional(),
  theme_overrides: z
    .object({
      bgColor: z.string().optional(),
      bgGradient: z.string().optional(),
      textColor: z.string().optional(),
      btnBgColor: z.string().optional(),
      btnTextColor: z.string().optional(),
      btnStyle: z.enum(['filled', 'outlined']).optional(),
      btnRadius: z.enum(['none', 'sm', 'md', 'full']).optional(),
      font: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const slugSchema = z.object({
  slug: z
    .string()
    .min(3, '슬러그는 3자 이상이어야 합니다')
    .max(30, '슬러그는 30자 이하여야 합니다')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      '슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다',
    ),
});

// Link schemas
export const linkCreateSchema = z.object({
  label: z
    .string()
    .min(1, '라벨을 입력해주세요')
    .max(100, '라벨은 100자 이하여야 합니다'),
  url: z.string().url('유효한 URL을 입력해주세요'),
  description: z.string().max(200, '설명은 200자 이하여야 합니다').nullable().optional(),
  icon: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const linkUpdateSchema = linkCreateSchema.partial();

export const linkReorderSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    }),
  ),
});

// Constants
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const BIO_MAX_LENGTH = 200;
export const LINK_LABEL_MAX_LENGTH = 100;
export const LINK_DESC_MAX_LENGTH = 200;
export const PASSWORD_MIN_LENGTH = 8;
export const MAX_LINKS_PER_PROFILE = 50;
export const MAX_SOCIAL_LINKS = 10;
export const AVATAR_MAX_SIZE_MB = 5;
