// Since package.json is outside the src folder, we go up twice
import packageJson from '../../package.json';

export const APP_CONFIG = {
    name: "ClassFlow Prime",
    version: packageJson.version,
    githubRepo: "https://github.com/tarikul3639/classflow-prime",
    get releaseLink() {
        return `${this.githubRepo}/releases/tag/web-v${this.version}`;
    }
};