import Canvas from "./Canvas.js"
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './foundation.min.css';
import './fontawesome-free-5.0.13/web-fonts-with-css/css/fontawesome-all.css';
import './fontawesome-free-5.0.13/web-fonts-with-css/css/fontawesome.min.css';


function SocialBar(props) {
    return (
        <div id="social-links-wrapper">
            <ul className="social-links">
                <li>
                    <a href={"https://github.com/Bijan-Massoumi"}> <i class="fab fa-github-square fa-fw"></i> </a>
                </li>
                <li>
                    <a href={"https://www.linkedin.com/in/bijan-massoumi-40280199/"}> <i class="fab fa-linkedin fa-fw"></i> </a>
                </li>
                <li>
                    <a href={"https://twitter.com/BijanMassoumi"}> <i class="fab fa-twitter-square fa-fw"></i></a>
                </li>
                <li>
                    <a href={"https://www.quora.com/profile/Bijan-Massoumi-2"}> <i class="fab fa-quora fa-fw"></i></a>
                </li>
                <li>
                    <a href={"http://bijanm.me/final_resume.pdf"}> <i class="far fa-file-pdf fa-fw"></i> </a>
                </li>
            </ul>
        </div>
    );
}

function NameBar(props) {
    return (
        <div class= "large-4 columns biji-info">
            <div className = "row">
                <div class= "large-6 columns photo-container">
                    <div id="my-photo"></div>
                </div>
                <div class="large-6 columns">
                    <h1>Bijan Massoumi</h1>
                </div>
            </div>
            <SocialBar/>
        </div>
    );
}

class App extends React.Component {
    render() {
        return (
            <div className="main-outer">
                <div className= "main-middle">
                    <div className="main-container">
                        <div className="row content">
                            <NameBar />
                            <div className="large-8 columns">
                                <Canvas/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
