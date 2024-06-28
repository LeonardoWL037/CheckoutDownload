import React, { useEffect, useState } from 'react';
import './DownloadCheckout.css';
import logo from './checkout-sankhya.png';

const DownloadCheckout = () => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Desenvolvimento');

  useEffect(() => {
    document.title = 'Checkout Dev Download';
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
    const results = links.filter(link => {
      const isMatch = link.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isFiltered = filter === 'Desenvolvimento' ? link.name.includes('OS') : !link.name.includes('OS');
      return isMatch && isFiltered;
    });

    results.sort((a, b) => {
      const getDate = (name) => {
        const startIndex = name.indexOf('b') + 1;
        const endIndex = name.indexOf('_windows');
        const dateString = name.substring(startIndex, endIndex);

        const year = parseInt(dateString.substring(0, 2), 10) + 2000;
        const month = parseInt(dateString.substring(2, 4), 10) - 1;
        const day = parseInt(dateString.substring(4, 6), 10);
        const hour = parseInt(dateString.substring(6, 8), 10);
        const minute = parseInt(dateString.substring(8, 10), 10);

        return new Date(year, month, day, hour, minute);
      };

      const dateA = getDate(a.name);
      const dateB = getDate(b.name);

      return dateB - dateA;
    });

    setFilteredLinks(results);
  }, [searchTerm, links, filter]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>
        <img src={logo} alt="Sankhya Checkout Logo" className="logo" /> Checkout Dev
      </h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquise pela OS ou versão"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Desenvolvimento">Desenvolvimento</option>
          <option value="Aberta">Aberta</option>
        </select>
      </div>
      <div className="grid-container">
        {filteredLinks.map((link, index) => (
          <div key={index} className="grid-item">
            <div className="file-name">{link.name}</div>
            <div className="build-date">{formatBuildDate(link.name)}</div>
            <a href={link.link} download className="download-link">Baixar</a>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatBuildDate(name) {
  const startIndex = name.indexOf('b') + 1;
  const endIndex = name.indexOf('_windows');
  const dateString = name.substring(startIndex, endIndex);

  const year = parseInt(dateString.substring(0, 2), 10) + 2000;
  const month = parseInt(dateString.substring(2, 4), 10);
  const day = parseInt(dateString.substring(4, 6), 10);
  const hour = parseInt(dateString.substring(6, 8), 10);
  const minute = parseInt(dateString.substring(8, 10), 10);

  const formattedMinute = minute.toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${formattedMinute}`;
}

export default DownloadCheckout;
