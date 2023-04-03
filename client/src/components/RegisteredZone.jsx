import {Routes, Route} from "react-router-dom";
import AccountInfo from './AccountInfo.jsx';
import MyGallery from "./MyGallery.jsx";
import UploadPhoto from './UploadPhoto.jsx';

function RegisteredZone() {

  const RoutesComponent = () => {
    return (
      <Routes>
        <Route path="/" element={<h1>Bonjour</h1>} />
        <Route path="/upload" element={<UploadPhoto />} />
        <Route path="/my-gallery" element={<MyGallery />} />
        <Route path="/*" element={<p>L'accès à cete page n'est pas autorisé.</p>} />
      </Routes>
    );
  };

    return (
        <>
            <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <a href="/">
                    <img id="mini-logo" src="logo_carre_shutterproof.png" alt="" />
                </a>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="/" id="dropdown1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Mes photos</a>
                            <div className="dropdown-menu" aria-labelledby="dropdown1">
                                <a className="dropdown-item" href="/my-gallery">Ma galerie</a>
                                <a className="dropdown-item" href="/upload">Ajouter une photo</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="/" id="dropdown2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Achat/Vente</a>
                            <div className="dropdown-menu" aria-labelledby="dropdown2">
                                <a className="dropdown-item" href="/">Acheter des photos</a>
                                <a className="dropdown-item" href="/">Vendre mes photos</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="/" id="dropdown3" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Location</a>
                            <div className="dropdown-menu" aria-labelledby="dropdown3">
                                <a className="dropdown-item" href="/">Louer des photos</a>
                                <a className="dropdown-item" href="/">Louer mes photos</a>
                            </div>
                        </li>
                    </ul>
                    <div className="form-inline my-2 my-lg-0">
                        <AccountInfo />
                    </div>
                </div>
            </nav>

            <main role="main" className="container">
                <RoutesComponent />
            </main>
        </>
    )
}

export default RegisteredZone