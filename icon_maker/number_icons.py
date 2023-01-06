from PIL import Image, ImageFont, ImageDraw
from distinctipy import distinctipy

n = 100 # number of colors and icons to generate

def add_number(number):
    '''Add the number to the center of an icon and save it to a new image
    Useful for generating multiple icons'''
    image = Image.new('RGBA', (60,100), (255,0,0))
    font=ImageFont.truetype('/usr/share/fonts/truetype/ubuntu/Ubuntu-M.ttf', 50)
    draw=ImageDraw.Draw(image)
    x=(image.size[0]-draw.textsize(number,font)[0])/2
    y=(image.size[1]-draw.textsize(number,font)[1])/2
    draw.text((x,y),number,font=font,fill='#FFFFFF')
    #image.show()
    image.save("./icons/icon_" + number + ".png")
 
for i in range(0, n):
    add_number(str(i))