// A leafy test image, inline so the harness needs no network.
export const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
    <rect width="160" height="100" fill="#d9c9a3"/>
    <ellipse cx="60" cy="55" rx="38" ry="22" fill="#3f7d3a" transform="rotate(-25 60 55)"/>
    <ellipse cx="105" cy="45" rx="34" ry="18" fill="#6aa84f" transform="rotate(20 105 45)"/>
    <rect x="76" y="60" width="6" height="40" fill="#5b4632"/>
  </svg>`,
)}`;
