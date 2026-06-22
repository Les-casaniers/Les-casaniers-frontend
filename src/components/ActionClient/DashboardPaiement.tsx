import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Loader2,
  Calendar,
  CreditCard,
  AlertCircle,
  User,
  Package,
  DollarSign,
  Hash,
  Clock,
  CheckCircle,
  ShoppingBag,
  UserCircle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from "@/contexts/AuthContext";

// Fonction pour convertir une image en base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    img.src = url;
  });
};

type Facture = {
  id: number;
  commande_id: number;
  facture_ref: string;
  statut: "en_attente" | "payee" | "annulee" | "brouillon" | "emise";
  montant_total: number | string;
  devise: string;
  methode_paiement: string;
  date_emission: string;
  date_paiement: string | null;
  pdf_path: string | null;
  date_creation: string;
  commande?: {
    id: number;
    commande_uuid: string;
    utilisateur_id: number;
    total: number | string;
    devise: string;
    statut: string;
    titre?: string;
    quantite?: number | string;
    prix_unitaire?: number | string;
    meta_json?: any;
    utilisateur?: {
      id: number;
      prenom: string;
      nom: string;
      email: string;
      telephone: string | null;
    };
    produits?: Array<{
      nom: string;
      quantite: number | string;
      prix_unitaire: number | string;
      sous_total: number | string;
    }>;
  };
};

const DashboardPaiement = () => {
  const { user } = useAuth();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/factures');
      console.log("Factures récupérées:", response.data);
      
      let facturesData: Facture[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        facturesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        facturesData = response.data;
      } else {
        facturesData = [];
      }
      
      setFactures(facturesData);
    } catch (error: any) {
      console.error("Erreur chargement factures:", error);
      toast.error("Impossible de charger vos factures");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (facture: Facture) => {
    setSelectedFacture(facture);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!selectedFacture) return;
    
    try {
      setDeletingId(selectedFacture.id);
      const response = await api.delete(`/factures/${selectedFacture.id}`);
      
      if (response.data.success) {
        toast.success(`Facture ${selectedFacture.facture_ref} supprimée`);
        await fetchFactures();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      toast.error(error.response?.data?.message || "Impossible de supprimer la facture");
    } finally {
      setDeletingId(null);
      setShowDeleteAlert(false);
      setSelectedFacture(null);
    }
  };

  // Fonction utilitaire pour convertir en nombre
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  // Fonction pour générer le PDF avec logo
  const generatePDFClient = async (facture: Facture) => {
    try {
      console.log('Génération du PDF pour:', facture.facture_ref);
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // === DESIGN ÉLÉGANT NOIR & BLANC AVEC LOGO ===
      
      // 1. BORDURE EXTÉRIEURE
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // 2. DOUBLE BORDURE INTÉRIEURE
      doc.setLineWidth(0.3);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);
      
      // 3. EN-TÊTE AVEC LOGO ET TITRE
      try {
        const logoUrl = '/favicon.ico';
        const logoBase64 = await imageToBase64(logoUrl);
        
        doc.addImage(logoBase64, 'PNG', 20, 18, 20, 20);
        
        doc.setFillColor(0, 0, 0);
        doc.rect(14, 14, pageWidth - 28, 45, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURE', pageWidth / 2 + 10, 38, { align: 'center' });
        
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(50, 45, pageWidth - 50, 45);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LES CASANIERS', pageWidth / 2 + 10, 52, { align: 'center' });
        
      } catch (error) {
        console.error('Erreur chargement logo:', error);
        doc.setFillColor(0, 0, 0);
        doc.rect(14, 14, pageWidth - 28, 45, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURE', pageWidth / 2, 38, { align: 'center' });
        
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(50, 45, pageWidth - 50, 45);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LES CASANIERS', pageWidth / 2, 52, { align: 'center' });
      }
      
      // 4. NUMÉRO DE FACTURE ET DATE D'ÉMISSION RÉELLE
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.text('RÉFÉRENCE', 20, 78);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(facture.facture_ref, 20, 86);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATE D\'ÉMISSION', pageWidth - 20, 78, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const dateEmission = facture.date_emission ? new Date(facture.date_emission) : new Date();
      doc.text(formatDate(dateEmission.toISOString()), pageWidth - 20, 86, { align: 'right' });
      
      // 5. LIGNE DE SÉPARATION
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(20, 94, pageWidth - 20, 94);
      
      let y = 106;
      
      // 6. INFORMATIONS CLIENT
      const client = facture.commande?.utilisateur;
      const commande = facture.commande;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 4, pageWidth - 40, 45, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('INFORMATIONS CLIENT', 24, y + 2);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (user) {
        const userInfo = `${user.prenom || ''} ${user.nom || ''}`.trim();
        doc.text(`Client: ${userInfo || 'Non spécifié'}`, 24, y + 14);
        doc.text(`Email: ${user.email || 'Non spécifié'}`, 24, y + 22);
    
      } else if (client) {
        const clientInfo = `${client.prenom || ''} ${client.nom || ''}`.trim();
        doc.text(`Client: ${clientInfo || 'Non spécifié'}`, 24, y + 14);
        doc.text(`Email: ${client.email || 'Non spécifié'}`, 24, y + 22);
        doc.text(`Téléphone: ${client.telephone || 'Non spécifié'}`, 24, y + 30);
      } else {
        doc.text('Client non spécifié', 24, y + 14);
      }
      
      y += 50;
      
      // 7. INFORMATIONS DE LA COMMANDE
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DE LA COMMANDE', 20, y);
      y += 6;
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(20, y, pageWidth - 20, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (commande) {
        doc.text(`Commande: ${commande.commande_uuid || 'N/A'}`, 20, y + 4);
        y += 8;
        doc.text(`Statut: ${getStatutLabel(commande.statut) || 'N/A'}`, 20, y + 4);
        y += 8;
        if (commande.titre) {
          doc.text(`Titre: ${commande.titre}`, 20, y + 4);
          y += 8;
        }
      }
      
      y += 5;
      
      // 8. PRODUITS
      let produits: any[] = [];
      
      if (commande?.meta_json) {
        let meta = commande.meta_json;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {
            console.error('Erreur parsing meta_json:', e);
            meta = {};
          }
        }
        if (meta && meta.produits && Array.isArray(meta.produits)) {
          produits = meta.produits;
        } else if (meta && meta.items && Array.isArray(meta.items)) {
          produits = meta.items;
        }
      }
      
      if (produits.length === 0 && commande?.titre) {
        produits = [{
          nom: commande.titre,
          quantite: commande.quantite || 1,
          prix_unitaire: commande.prix_unitaire || commande.total || 0,
          sous_total: commande.total || 0
        }];
      }
      
      if (produits.length === 0) {
        produits = [{
          nom: 'Produit',
          quantite: 1,
          prix_unitaire: toNumber(facture.montant_total),
          sous_total: toNumber(facture.montant_total)
        }];
      }
      
      if (produits.length > 0) {
        doc.setFillColor(0, 0, 0);
        doc.rect(20, y, pageWidth - 40, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        
        doc.text('PRODUIT', 24, y + 5.5);
        doc.text('QTÉ', 100, y + 5.5);
        doc.text('P.U.', 130, y + 5.5);
        doc.text('TOTAL', 170, y + 5.5);
        
        y += 8;
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        let sousTotal = 0;
        
        produits.forEach((produit: any, index: number) => {
          const isEven = index % 2 === 0;
          if (isEven) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, y, pageWidth - 40, 6, 'F');
          }
          
          const nom = produit.nom || produit.produit_nom || 'Produit';
          const quantite = toNumber(produit.quantite);
          const prixUnitaire = toNumber(produit.prix_unitaire || produit.prix);
          const total = toNumber(produit.sous_total || produit.total || (prixUnitaire * quantite));
          
          sousTotal += total;
          
          doc.text(nom.substring(0, 25), 24, y + 4);
          doc.text(quantite.toString(), 105, y + 4);
          doc.text(`${prixUnitaire.toFixed(2)} ${facture.devise}`, 130, y + 4);
          doc.text(`${total.toFixed(2)} ${facture.devise}`, 170, y + 4);
          
          y += 6;
        });
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, y, pageWidth - 20, y);
        y += 6;
        
        const montantTotal = toNumber(facture.montant_total || commande?.total || sousTotal);
        
        const rightX = pageWidth - 20;
        const colX = rightX - 60;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text('Sous-total:', colX, y + 4);
        doc.text(`${montantTotal.toFixed(2)} ${facture.devise}`, rightX, y + 4, { align: 'right' });
        y += 7;
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(colX, y, rightX, y);
        y += 7;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', colX, y + 4);
        doc.setTextColor(0, 0, 0);
        doc.text(`${montantTotal.toFixed(2)} ${facture.devise}`, rightX, y + 4, { align: 'right' });
        y += 12;
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(colX - 10, y - 14, rightX - colX + 20, 14);
        
        y += 10;
      }
      
      // 10. MÉTHODE DE PAIEMENT
      if (facture.methode_paiement) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y, pageWidth - 40, 20, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('MÉTHODE DE PAIEMENT', 24, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(facture.methode_paiement.toUpperCase(), 24, y + 14);
        y += 25;
      }
      
      // 11. STATUT (brouillon devient en_attente)
      const statutLabel = getStatutLabel(facture.statut);
      const isPaid = facture.statut === 'payee';
      const isDraft = facture.statut === 'brouillon';
      const isCancelled = facture.statut === 'annulee';
      const isPending = facture.statut === 'en_attente' || facture.statut === 'emise';
      
      let bgColor = [240, 240, 240];
      let textColor = [0, 0, 0];
      
      if (isPaid) {
        bgColor = [220, 255, 220];
        textColor = [0, 150, 0];
      } else if (isDraft) {
        bgColor = [255, 255, 220];
        textColor = [200, 150, 0];
      } else if (isCancelled) {
        bgColor = [255, 220, 220];
        textColor = [200, 0, 0];
      } else if (isPending) {
        bgColor = [255, 255, 220];
        textColor = [200, 150, 0];
      }
      
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(20, y, pageWidth - 40, 20, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
     
      
    
      
 
      
      // 12. PIED DE PAGE
      const footerY = pageHeight - 25;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(20, footerY, pageWidth - 20, footerY);
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Merci pour votre confiance !', pageWidth / 2, footerY + 6, { align: 'center' });
     
      
      doc.setFontSize(7);
      doc.text('Page 1/1', pageWidth - 20, footerY + 12, { align: 'right' });
      
      const pdfBlob = doc.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${facture.facture_ref}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`PDF ${facture.facture_ref} généré avec succès`);
      
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Impossible de générer le PDF");
    }
  };

  const handleDownload = async (facture: Facture) => {
    if (downloadingId === facture.id) return;
    
    try {
      setDownloadingId(facture.id);
      await generatePDFClient(facture);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Impossible de télécharger le PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const formatPrice = (prix: any, devise: string = 'MGA') => {
    const num = typeof prix === 'number' ? prix : parseFloat(prix) || 0;
    return new Intl.NumberFormat('fr-FR').format(num) + ` ${devise}`;
  };

  const getStatutStyle = (statut: string) => {
    const styles: Record<string, string> = {
      'payee': "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
      'brouillon': "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      'annulee': "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
      'emise': "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      'en_attente': "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
    };
    return styles[statut] || styles['en_attente'];
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'payee': 'Payée',
      'en_attente': 'En attente',
      'brouillon': 'En attente',  // ICI: brouillon devient En attente
      'emise': 'Émise',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  };

  const facturesFiltrees = factures.filter(facture => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      facture.facture_ref.toLowerCase().includes(searchLower) ||
      facture.commande?.commande_uuid?.toLowerCase().includes(searchLower) ||
      formatDate(facture.date_emission).includes(searchLower) ||
      facture.commande?.utilisateur?.prenom?.toLowerCase().includes(searchLower) ||
      facture.commande?.utilisateur?.nom?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos factures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes factures</h1>
          <p className="text-muted-foreground">Consultez et téléchargez vos factures</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-lg border border-border">
            <UserCircle className="h-4 w-4" />
            {user ? (
              <span className="font-medium text-foreground">
                {user.prenom} {user.nom}
              </span>
            ) : (
              <span>Client</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground bg-card px-4 py-2 rounded-lg border border-border">
            Total: <span className="font-semibold text-foreground">{factures.length}</span> factures
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par numéro de facture, commande, client ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

     

      {/* Liste des factures */}
      {facturesFiltrees.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune facture trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Aucune facture ne correspond à votre recherche" : "Vous n'avez pas encore de facture"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {facturesFiltrees.map((facture) => (
            <div
              key={facture.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-mono font-semibold text-foreground">{facture.facture_ref}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(facture.statut)}`}>
                      {getStatutLabel(facture.statut)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(facture.date_emission)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Commande: {facture.commande?.commande_uuid || 'N/A'}
                    </span>
                    {facture.commande?.utilisateur && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {facture.commande.utilisateur.prenom} {facture.commande.utilisateur.nom}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
               
                    {facture.commande && (
                      <p className="text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                        Total: {formatPrice(facture.commande.total || facture.montant_total, facture.devise)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatPrice(facture.montant_total, facture.devise)}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleDownload(facture)}
                      disabled={downloadingId === facture.id}
                      className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50"
                    >
                      {downloadingId === facture.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {downloadingId === facture.id ? 'Téléchargement...' : 'PDF'}
                    </button>
                    <button
                      onClick={() => handleDelete(facture)}
                      disabled={deletingId === facture.id}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50"
                    >
                      {deletingId === facture.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteAlert && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Supprimer la facture</h3>
              <p className="text-muted-foreground">
                Facture <span className="font-semibold text-foreground">{selectedFacture.facture_ref}</span>
              </p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaiement;