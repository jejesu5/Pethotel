function mailTemplate ({ title, description, cuadro, footer, alert }) {
  return `<table style="background-color: #eaeaea; font-family: arial, sans-serif; border-collapse: collapse; width: 100%;">
        <tr>
            <td style="width: 20%; height: 5rem"></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <table style="background-color: white; border-radius: 8px; font-family: arial, sans-serif; border-collapse: collapse; width: 100%;">
                    <tr>
                        <td>
                            <a href="#">
                                <img style='width: 100%; height: 18.75em; border-radius: 8px 8px 0 0;'
                                    src="https://rz-bucket-test.s3.amazonaws.com/161777868_800167307934865_662344070264278192_n.jpg"
                                    alt={'hola'}/>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h1 style="text-align: center">${title}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">
                            <p style='text-align: justify; font-size: 1rem'>
                                ${description}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px">
                            <p style='font-size: 2rem; background-color:#eaeaea; text-align: center; '><b>${cuadro}</b></p>
                            <br/>
                            <p style='text-align: center; font-size: 1rem'>
                                ${footer}
                            </p>
                            <br/>
                            <p style='color: red; text-align: center;'><b>${alert}</b></p>
                        </td>
                    </tr>
                </table>
            </td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td style="width: 20%; height: 5rem;"></td>
        </tr>
    </table>`
}
module.exports = mailTemplate
