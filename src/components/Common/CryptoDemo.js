import { useState } from 'react';
import PageContent from './PageContent';
import { decryptData, encryptData } from './CryptoUtils';
import { defaultTheme } from '../../helpers/defaultTheme';

// --- End AES Utility Functions ---
const AESDemo = () => {
  const [inputText, setInputText] = useState('');
  const handleEncrypt = async () => {
    encryptData(inputText).then((encrypted) => {
      console.log("Encrypt ", encrypted)
    }).catch((error) => {
      console.log(error)
    });
  };

  const handleDecrypt = async () => {
    decryptData(inputText).then((decrypted) => {
      console.log("Decrypt ", decrypted)
    }).catch((error) => {
      console.log(error)
    });
  };

  return (
    <PageContent>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h2>Encryption/Decryption Demo</h2>

        <div style={{ marginBottom: '10px' }}>
          <label><strong>Input Text:</strong></label><br />
          <textarea
            rows={5}
            style={{ width: '100%' }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button onClick={handleEncrypt} style={{ marginRight: '10px', backgroundColor: defaultTheme.primary }}>Encrypt</button>
          <button onClick={handleDecrypt}>Decrypt</button>
        </div>

      </div>
    </PageContent>
  );
};

export default AESDemo;
