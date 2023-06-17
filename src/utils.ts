export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type OptionToElementProps<T> = Partial<
  Pick<
    T,
    {
      [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T]
  >
> & {
  name: string;
  description: string;
};
