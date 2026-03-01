declare module '*.svg?react' {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default ReactComponent;
}

declare module '*.svg' {
    import { StaticImageData } from 'next/image';
    const content: StaticImageData;
    export default content;
}
