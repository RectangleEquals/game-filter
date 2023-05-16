import WebsiteLogo from 'assets/react.svg';
import UserAvatar from 'assets/avatar.svg';
import DiscordLogo from 'assets/discord.svg';
import MainLogo from 'assets/logo.svg';
import Tumbleweed from 'assets/tumbleweed.png';
import UFO from 'assets/ufo.gif';

export default function ImageAsset(props) {
  const { className } = props;

  const getAsset = () => {
    // Determines which asset to load
    if (props && props.className) {
      if(props.className.startsWith('asset-user-avatar'))
        return UserAvatar;
      else if(props.className.startsWith('asset-discord-logo'))
        return DiscordLogo;
      else if(props.className.startsWith('asset-website-logo'))
        return WebsiteLogo;
      else if(props.className.startsWith('asset-tumbleweed'))
        return Tumbleweed;
      else if(props.className.startsWith('asset-ufo'))
        return UFO;
      else
        return MainLogo;
    }
    return ''; // Unsupported attribute
  }

  const getImageStyle = () => {
    // Bootstrap styling for `img` goes here
    const prefix = 'img-';
    const imageStyles = className
      .split(' ')
      .filter(style => style.startsWith(prefix))
      .map(style => style.slice(prefix.length))
      .join(' ');
    const borderStyles = getBorderStyles();
    return `${imageStyles} ${borderStyles}`.trim();
  }

  const getDivStyle = () => {
    // Bootstrap styling for `div` goes here
    const prefix = 'div-';
    const divStyles = className
      .split(' ')
      .filter(style => style.startsWith(prefix))
      .map(style => style.slice(prefix.length))
      .join(' ');
    const borderStyles = getBorderStyles('div');
    return `${divStyles} ${borderStyles}`.trim();
  }

  const getBorderStyles = (type = 'img') => {
    // Check if show-border is specified and append appropriate border style
    const prefix = `${type}-show-border`;
    if (className && className.includes(prefix)) {
      return 'border rounded-circle';
    }
    return '';
  }

  return (
    props && props.style ? 
      <div className={getDivStyle()} style={props.style}>
        <img src={getAsset()} className={getImageStyle()} />
      </div> 
    : 
      <div className={getDivStyle()}>
        <img src={getAsset()} className={getImageStyle()} />
      </div>
  );
}
