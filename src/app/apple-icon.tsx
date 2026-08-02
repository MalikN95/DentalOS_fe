import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const AppleIcon = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#5C59E8',
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5.5C10.5 4 8.5 3 7 3 4.5 3 3 5 3 7.5c0 4 2 6 2.6 9.3.3 1.8.9 4.2 2.2 4.2 1.4 0 1.3-2.6 1.7-4.3.3-1.3 1.1-2.2 2.5-2.2s2.2.9 2.5 2.2c.4 1.7.3 4.3 1.7 4.3 1.3 0 1.9-2.4 2.2-4.2C19 13.5 21 11.5 21 7.5 21 5 19.5 3 17 3c-1.5 0-3.5 1-5 2.5Z"
            fill="#fff"
          />
        </svg>
      </div>
    ),
    { ...size }
  );

export default AppleIcon;
