import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import com.beust.jcommander.Parameter;
import com.beust.jcommander.JCommander;
import com.beust.jcommander.MissingCommandException;
import com.beust.jcommander.ParameterException;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.PdfCopy;
import com.itextpdf.text.pdf.PdfImportedPage;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.exceptions.InvalidPdfException;
import java.util.ArrayList;

public final class Jsert{
    @Parameter(names={"--overwrite","-r"},description="set if you indend to overwrite the file. [Default: keep the file]")
    private static boolean remove=false;
    @Parameter(names={"--verbose","-v"},description="Verbose output.")
    private static boolean verbose=false;
    @Parameter(description="input files",required=true)
    private static ArrayList<String> files=new ArrayList<String>();

    public final static void InsertInto_ReserveMode(String pdfFile,String to) throws IOException, DocumentException{
        if (verbose){
            System.out.println("\n---------------------------");
            System.out.println("Initializing reader, document and copier for "+pdfFile);
        }
        PdfReader reader=new PdfReader(pdfFile);
        Document document=new Document(reader.getPageSizeWithRotation(1));
        PdfCopy copier=new PdfCopy(document,new FileOutputStream(to));
        int numOfPages=reader.getNumberOfPages();
        document.open();
        System.out.print("Rendering pages ");
        for (int i=1;i<=numOfPages;i++){
            if (verbose){
                System.out.print(" "+i+" ");
            }
            PdfImportedPage page=copier.getImportedPage(reader,i);
            copier.addPage(page);
            copier.addPage(reader.getPageSizeWithRotation(1),0);
        }
        if (verbose){
            System.out.println("\nComplete insertion for file "+pdfFile);
            System.out.println("---------------------------");
        }
        document.close();
        reader.close();
    }

    public final static void InsertInto_OverwriteMode(String pdfFile) throws IOException,DocumentException{
        Jsert.InsertInto_ReserveMode(pdfFile,"tmp.pdf");
        if (new File(pdfFile).delete()){
            new File("tmp.pdf").renameTo(new File(pdfFile));
        }
    }

    public final static void main(String[] args) {
        Jsert jsert=new Jsert();
        JCommander cmd=JCommander.newBuilder()
            .addObject(jsert)
            .build();
        try{
            cmd.parse(args);
        }catch (ParameterException e){
            cmd.usage();
            System.exit(1);
        }
        for (String file:files){
            try{
                System.out.print("Processing file: "+file+" ...... ");
                if (!file.endsWith(".pdf")){
                    System.out.println("Failed: file must ends in .pdf format.");
                    continue;
                }else{
                    file=file.replace(".pdf","");
                }
                if (remove){
                    Jsert.InsertInto_OverwriteMode(file+".pdf");
                }else{
                    Jsert.InsertInto_ReserveMode(file+".pdf",file+".out.pdf");
                }
                System.out.print("Success! \n");
            }catch (IOException|DocumentException e){
                System.out.println("Failed because of "+e+" (or broken file?)");
                continue;
            }
        }
    }
}
