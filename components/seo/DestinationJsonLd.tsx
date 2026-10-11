import React from 'react';

export default function DestinationJsonLd(props: any) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(props) }} />;
}
