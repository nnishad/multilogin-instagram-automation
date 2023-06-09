import handlebars from 'handlebars';

// Function to generate HTML content using Handlebars template
export function generateHTMLContent(properties: any[]): string {
  const templateSource = `
    <html lang="en">
      <head>
        <style>
            /* Table styles */
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: Arial, sans-serif;
            }
            
            th {
              background-color: #f2f2f2;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
            }
            
            td {
              border: 1px solid #ddd;
              padding: 10px;
            }
            
            /* Hyperlink styles */
            a {
              color: #0066cc;
              text-decoration: none;
            }
            
            /* Increase font size */
            td {
              font-size: 30px;
            }
          </style>
        <title>Nikhil Nishad</title>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Price</th>
              <th>Address</th>
              <th>Description</th>
              <th>Bedrooms</th>
              <th>Bathrooms</th>
              <th>Telephone</th>
              <th>Contact Link</th>
              <th>Property Link</th>
              <th>Additional</th>
            </tr>
          </thead>
          <tbody>
            {{#each properties}}
            <tr>
              <td>{{price}}</td>
              <td>{{address}}</td>
              <td>{{description}}</td>
              <td>{{bedrooms}}</td>
              <td>{{bathrooms}}</td>
              <td><a href="tel:{{telephone}}">{{telephone}}</a></td>
              <td><a href="{{contactLink}}">ContactForm</a></td>
              <td><a href="{{propertyLink}}">Property Link</a></td>
              <td>{{additional}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const template = handlebars.compile(templateSource);
  return template({ properties });
}
