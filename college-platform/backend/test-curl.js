fetch('http://localhost:5000/api/colleges/search-ai?name=VELLORE%20INSTITUTE%20OF%20TECHNOLOGY')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
