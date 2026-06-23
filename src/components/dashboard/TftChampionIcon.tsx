import Image from "next/image";

type Props = {
  name: string;
  imageUrl: string;
  size?: number;
};

export function TftChampionIcon({ name, imageUrl, size = 40 }: Props) {
  return (
    <Image
      src={imageUrl}
      alt={name}
      width={size}
      height={size}
      // チャンピオン画像を丸角で表示する
      className="rounded-md object-cover"
    />
  );
}
