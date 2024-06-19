import React, { useEffect, useState } from 'react';
import './DownloadCheckout.css';
import logo from './checkout-sankhya.png';

const DownloadCheckout = () => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.xml');
        if (!response.ok) {
          throw new Error('Não houve resposta da rede');
        }
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const keys = Array.from(xml.getElementsByTagName('Key'));

        const validKeys = keys.filter(key =>
          key.textContent.startsWith('Sankhya_Checkout') && key.textContent.endsWith('_windows.exe')
        );

        const newLinks = validKeys.map(key => {
          const fileName = key.textContent;
          const name = fileName.split('.').slice(0, -1).join('.');
          const downloadLink = `https://sankhya-pdv.s3.amazonaws.com/${fileName}`;
          return { name, link: downloadLink };
        });

        setLinks(newLinks);
        setFilteredLinks(newLinks);
      } catch (error) {
        console.error('Erro ao processar Xml de retorno:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const results = links.filter(link =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(results);
  }, [searchTerm, links]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>
        <img src={logo} alt="Sankhya Checkout Logo" className="logo" /> Checkout Dev
      </h1>
      <input
        type="text"
        placeholder="Pesquise pela OS ou versão"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="grid-container">
        {filteredLinks.map((link, index) => (
          <div key={index} className="grid-item">
            <div className="file-name">{link.name}</div>
            <a href={link.link} download className="download-link">Download</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadCheckout;
