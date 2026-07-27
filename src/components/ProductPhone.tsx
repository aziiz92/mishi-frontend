export function ProductPhone({
  src,
  alt,
  eager = false,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  return (
    <figure className="product-phone-wrap">
      <div className="product-phone-light" aria-hidden="true" />
      <div className="product-phone">
        <div className="product-phone-screen">
          <img
            src={src}
            alt={alt}
            width="804"
            height="1748"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
      <div className="product-phone-shadow" aria-hidden="true" />
    </figure>
  );
}
